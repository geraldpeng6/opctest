import assert from "node:assert/strict";
import { DatabaseSync, type SQLInputValue, type StatementSync } from "node:sqlite";
import test from "node:test";

import { getAuthMeResponse, loginWithName } from "@/lib/auth";
import {
  setD1Database,
  type D1Database,
  type D1Statement,
} from "@/lib/d1-records";

class TestStatement implements D1Statement {
  private values: SQLInputValue[] = [];

  constructor(private readonly statement: StatementSync) {}

  bind(...values: unknown[]) {
    this.values = values as SQLInputValue[];
    return this;
  }

  async first<T>() {
    return (this.statement.get(...this.values) as T | undefined) ?? null;
  }

  async all<T>() {
    return { results: this.statement.all(...this.values) as T[] };
  }

  async run() {
    const result = this.statement.run(...this.values);
    return { meta: { changes: Number(result.changes) } };
  }
}

class TestDatabase implements D1Database {
  readonly sqlite = new DatabaseSync(":memory:");

  prepare(query: string) {
    return new TestStatement(this.sqlite.prepare(query));
  }
}

test("D1 会保存考生与会话，并按昵称恢复同一考生", async () => {
  const database = new TestDatabase();
  setD1Database(database);

  try {
    const first = await loginWithName({ name: "持久化测试" });
    const restored = await getAuthMeResponse(first.session_token);
    const second = await loginWithName({ name: "持久化测试" });

    assert.equal(restored.candidate.candidate_id, first.candidate.candidate_id);
    assert.equal(second.candidate.candidate_id, first.candidate.candidate_id);
    assert.deepEqual(restored.candidate.unlocked_levels, ["level-1"]);
  } finally {
    setD1Database(null);
    database.sqlite.close();
  }
});
