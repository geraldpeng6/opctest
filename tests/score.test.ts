import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loginWithName } from "@/lib/auth";
import { createOrLoadAttemptForCandidate, getStoredAttempt } from "@/lib/attempts";
import { normalizeAnswer } from "@/lib/normalize";
import { setRuntimeRootForTests } from "@/lib/runtime-paths";
import { scoreSubmission } from "@/lib/score";

function withRuntimeDir() {
  const dir = mkdtempSync(join(tmpdir(), "opctest-runtime-score-"));
  setRuntimeRootForTests(dir);
  return dir;
}

function cleanupRuntimeDir(dir: string) {
  setRuntimeRootForTests(null);
  rmSync(dir, { recursive: true, force: true });
}

test("答案归一化能处理单选和日期格式", () => {
  assert.equal(normalizeAnswer(" c ", "single_choice"), "C");
  assert.equal(normalizeAnswer("1991-03-14", "date_yyyymmdd"), "19910314");
  assert.equal(normalizeAnswer(" 22 ", "integer"), "22");
});

test("答案归一化能处理新增题型", () => {
  assert.equal(normalizeAnswer("c, A，a", "multiple_choice"), "A,C");
  assert.equal(normalizeAnswer("b > d > a", "ordered_list"), "B>D>A");
  assert.equal(normalizeAnswer("10.0", "decimal"), "10");
  assert.equal(
    normalizeAnswer('{"items":["A1"],"name":"样例"}', "json_object"),
    normalizeAnswer('{"name":"样例","items":["A1"]}', "json_object"),
  );
  assert.equal(normalizeAnswer(" patch-b ", "code_patch"), "PATCH-B");
});

test("提交判分会返回预期成绩结构", async () => {
  const dir = withRuntimeDir();

  const auth = await loginWithName({
    name: "壬九",
  }, Date.UTC(2026, 3, 24, 10, 0, 0));

  const exam = await createOrLoadAttemptForCandidate(
    "level-1",
    auth.candidate,
    Date.UTC(2026, 3, 24, 10, 0, 0),
    () => 0.24,
  );
  const attempt = await getStoredAttempt(exam.attempt_id!);
  assert.ok(attempt);

  const graded = await scoreSubmission(
    {
      exam_id: exam.exam_id,
      attempt_id: exam.attempt_id!,
      answers: {
        q01: attempt!.answer_key.q01,
        q02: attempt!.answer_key.q02,
        q03: "19910314",
      },
    },
    Date.UTC(2026, 3, 24, 10, 5, 0),
  );

  assert.equal(graded.exam_id, "level-1-20260424");
  assert.equal(graded.total, 10);
  assert.equal(graded.results.length, 10);
  assert.equal(graded.score, 3);
  assert.equal(graded.status, "submitted");
  cleanupRuntimeDir(dir);
});
