import test from "node:test";
import assert from "node:assert/strict";

import { GET as getExam } from "@/app/api/exams/level-1/route";
import { POST as postSubmission } from "@/app/api/submissions/route";

test("GET /api/exams/level-1 returns 10 questions and no answer key", async () => {
  const response = getExam();
  const payload = await response.json();

  assert.equal(payload.exam_id, "level-1-20260424");
  assert.equal(payload.questions.length, 10);
  assert.equal("answers" in payload, false);
});

test("POST /api/submissions grades with normalization", async () => {
  const request = new Request("http://localhost:3000/api/submissions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      exam_id: "level-1-20260424",
      answers: {
        q01: " b ",
        q03: "1991-03-14",
        q10: "8000",
      },
    }),
  });

  const response = await postSubmission(request);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.results.find((entry: { id: string }) => entry.id === "q01").correct, true);
  assert.equal(payload.results.find((entry: { id: string }) => entry.id === "q03").correct, true);
  assert.equal(payload.results.find((entry: { id: string }) => entry.id === "q10").correct, true);
});
