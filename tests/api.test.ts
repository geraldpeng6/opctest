import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { POST as loginRoute } from "@/app/api/auth/login/route";
import { GET as meRoute } from "@/app/api/auth/me/route";
import { GET as leaderboardRoute } from "@/app/api/leaderboards/route";
import { GET as getLevel1Exam } from "@/app/api/exams/level-1/route";
import { GET as getLevel2Exam } from "@/app/api/exams/level-2/route";
import { POST as postSubmission } from "@/app/api/submissions/route";
import { createCandidateRecord, saveRegistry } from "@/lib/auth";
import { getStoredAttempt } from "@/lib/attempts";
import { setRuntimeRootForTests } from "@/lib/runtime-paths";

function withRuntimeDir() {
  const dir = mkdtempSync(join(tmpdir(), "opctest-runtime-"));
  setRuntimeRootForTests(dir);
  return dir;
}

function cleanupRuntimeDir(dir: string) {
  setRuntimeRootForTests(null);
  rmSync(dir, { recursive: true, force: true });
}

function seedCandidates(codes: Array<{ code: string; maxLevel: number }>) {
  saveRegistry({
    candidates: codes.map((entry) =>
      createCandidateRecord(entry.code, entry.maxLevel, "2026-04-24T10:00:00.000Z"),
    ),
  });
}

async function login(code: string, name?: string) {
  const response = await loginRoute(
    new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ code, name }),
    }),
  );

  return {
    response,
    payload: await response.json(),
  };
}

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
  };
}

test("candidate can activate code, fetch me, and fetch level-1 exam", async () => {
  const dir = withRuntimeDir();
  seedCandidates([{ code: "elephant-23456789abcdefghjkmn", maxLevel: 2 }]);

  const loginResult = await login("elephant-23456789abcdefghjkmn", "Alice");
  assert.equal(loginResult.response.status, 200);
  assert.equal(loginResult.payload.candidate.name, "Alice");

  const token = loginResult.payload.session_token as string;
  const meResponse = meRoute(
    new Request("http://localhost:3000/api/auth/me", {
      headers: authHeaders(token),
    }),
  );
  const mePayload = await meResponse.json();
  assert.equal(meResponse.status, 200);
  assert.deepEqual(mePayload.candidate.unlocked_levels, ["level-1"]);

  const examResponse = getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const examPayload = await examResponse.json();

  assert.equal(examResponse.status, 200);
  assert.equal(examPayload.exam_id, "level-1-20260424");
  assert.equal(typeof examPayload.attempt_id, "string");
  assert.equal(examPayload.candidate_name, "Alice");
  cleanupRuntimeDir(dir);
});

test("level-2 is locked before passing level-1", async () => {
  const dir = withRuntimeDir();
  seedCandidates([{ code: "otter-23456789abcdefghjkmn", maxLevel: 2 }]);

  const loginResult = await login("otter-23456789abcdefghjkmn", "Bob");
  const token = loginResult.payload.session_token as string;

  const response = getLevel2Exam(
    new Request("http://localhost:3000/api/exams/level-2", {
      headers: authHeaders(token),
    }),
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.match(payload.error, /not unlocked/i);
  cleanupRuntimeDir(dir);
});

test("submission records a final result and unlocks level-2 after passing level-1", async () => {
  const dir = withRuntimeDir();
  seedCandidates([{ code: "falcon-23456789abcdefghjkmn", maxLevel: 2 }]);

  const loginResult = await login("falcon-23456789abcdefghjkmn", "Carol");
  const token = loginResult.payload.session_token as string;

  const examResponse = getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const examPayload = await examResponse.json();
  const attempt = getStoredAttempt(examPayload.attempt_id);
  assert.ok(attempt);

  const answers = Object.fromEntries(
    Object.entries(attempt!.answer_key).map(([id, expected]) => [id, expected]),
  );

  const submitResponse = await postSubmission(
    new Request("http://localhost:3000/api/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({
        exam_id: examPayload.exam_id,
        attempt_id: examPayload.attempt_id,
        answers,
      }),
    }),
  );
  const submitPayload = await submitResponse.json();

  assert.equal(submitResponse.status, 200);
  assert.equal(submitPayload.score, 10);

  const meResponse = meRoute(
    new Request("http://localhost:3000/api/auth/me", {
      headers: authHeaders(token),
    }),
  );
  const mePayload = await meResponse.json();
  assert.deepEqual(mePayload.candidate.unlocked_levels, ["level-1", "level-2"]);

  const records = readFileSync(join(dir, "records", "submissions.jsonl"), "utf8")
    .trim()
    .split("\n");
  assert.equal(records.length, 1);
  cleanupRuntimeDir(dir);
});

test("same candidate cannot submit the same level twice", async () => {
  const dir = withRuntimeDir();
  seedCandidates([{ code: "panda-23456789abcdefghjkmn", maxLevel: 2 }]);

  const loginResult = await login("panda-23456789abcdefghjkmn", "Dora");
  const token = loginResult.payload.session_token as string;

  const examResponse = getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const examPayload = await examResponse.json();

  const payload = {
    exam_id: examPayload.exam_id,
    attempt_id: examPayload.attempt_id,
    answers: {},
  };

  const first = await postSubmission(
    new Request("http://localhost:3000/api/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(payload),
    }),
  );

  const second = getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const secondPayload = await second.json();

  assert.equal(first.status, 200);
  assert.equal(second.status, 409);
  assert.match(secondPayload.error, /already been finalized/i);
  cleanupRuntimeDir(dir);
});

test("duplicate display names are rejected", async () => {
  const dir = withRuntimeDir();
  seedCandidates([
    { code: "wolf-23456789abcdefghjkmn", maxLevel: 2 },
    { code: "seal-23456789abcdefghjkmn", maxLevel: 2 },
  ]);

  const firstLogin = await login("wolf-23456789abcdefghjkmn", "Echo");
  assert.equal(firstLogin.response.status, 200);

  const secondLogin = await login("seal-23456789abcdefghjkmn", "Echo");
  assert.equal(secondLogin.response.status, 400);
  assert.match(secondLogin.payload.error, /already taken/i);
  cleanupRuntimeDir(dir);
});

test("leaderboards expose names but never candidate codes", async () => {
  const dir = withRuntimeDir();
  seedCandidates([{ code: "zebra-23456789abcdefghjkmn", maxLevel: 2 }]);

  const loginResult = await login("zebra-23456789abcdefghjkmn", "Faye");
  const token = loginResult.payload.session_token as string;
  const examResponse = getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const examPayload = await examResponse.json();
  const attempt = getStoredAttempt(examPayload.attempt_id);

  await postSubmission(
    new Request("http://localhost:3000/api/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({
        exam_id: examPayload.exam_id,
        attempt_id: examPayload.attempt_id,
        answers: Object.fromEntries(
          Object.entries(attempt!.answer_key).map(([id, expected]) => [id, expected]),
        ),
      }),
    }),
  );

  const leaderboardResponse = leaderboardRoute();
  const leaderboardPayload = await leaderboardResponse.json();

  assert.equal(leaderboardResponse.status, 200);
  assert.equal(leaderboardPayload.overall_top3[0].name, "Faye");
  assert.equal(JSON.stringify(leaderboardPayload).includes("zebra-23456789abcdefghjkmn"), false);
  cleanupRuntimeDir(dir);
});
