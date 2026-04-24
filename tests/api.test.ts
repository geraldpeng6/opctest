import test from "node:test";
import assert from "node:assert/strict";

import { GET as getExam } from "@/app/api/exams/level-1/route";
import { GET as getLevel2Exam } from "@/app/api/exams/level-2/route";
import { POST as postSubmission } from "@/app/api/submissions/route";

test("GET /api/exams/level-1 returns 10 questions and no answer key", async () => {
  const response = getExam();
  const payload = await response.json();

  assert.equal(payload.exam_id, "level-1-20260424");
  assert.equal(payload.questions.length, 10);
  assert.equal("answers" in payload, false);
});

test("GET /api/exams/level-2 returns 10 questions and no answer key", async () => {
  const response = getLevel2Exam();
  const payload = await response.json();

  assert.equal(payload.exam_id, "level-2-20260424");
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

test("POST /api/submissions grades level-2 answers", async () => {
  const request = new Request("http://localhost:3000/api/submissions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      exam_id: "level-2-20260424",
      answers: {
        q01: "23.4",
        q02: "1.1",
        q03: "4",
        q04: "10",
        q05: "24",
        q06: "9967232",
        q07: "8",
        q08: "1.2",
        q09: "65317",
        q10: "185"
      },
    }),
  });

  const response = await postSubmission(request);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.score, 10);
});
