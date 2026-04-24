import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createCandidateRecord, loginWithCode, saveRegistry } from "@/lib/auth";
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

test("normalizeAnswer handles single choice and date formats", () => {
  assert.equal(normalizeAnswer(" c ", "single_choice"), "C");
  assert.equal(normalizeAnswer("1991-03-14", "date_yyyymmdd"), "19910314");
  assert.equal(normalizeAnswer(" 22 ", "integer"), "22");
});

test("scoreSubmission returns expected score shape", () => {
  const dir = withRuntimeDir();
  saveRegistry({
    candidates: [createCandidateRecord("eagle-23456789abcdefghjkmn", 2, "2026-04-24T10:00:00.000Z")],
  });

  const auth = loginWithCode({
    code: "eagle-23456789abcdefghjkmn",
    name: "Gina",
  }, Date.UTC(2026, 3, 24, 10, 0, 0));

  const exam = createOrLoadAttemptForCandidate(
    "level-1",
    auth.candidate,
    Date.UTC(2026, 3, 24, 10, 0, 0),
    () => 0.24,
  );
  const attempt = getStoredAttempt(exam.attempt_id!);
  assert.ok(attempt);

  const graded = scoreSubmission(
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
