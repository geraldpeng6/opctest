import test from "node:test";
import assert from "node:assert/strict";

import { normalizeAnswer } from "@/lib/normalize";
import { scoreSubmission } from "@/lib/score";

test("normalizeAnswer handles single choice and date formats", () => {
  assert.equal(normalizeAnswer(" c ", "single_choice"), "C");
  assert.equal(normalizeAnswer("1991-03-14", "date_yyyymmdd"), "19910314");
  assert.equal(normalizeAnswer(" 22 ", "integer"), "22");
});

test("scoreSubmission returns expected score shape", () => {
  const payload = {
    exam_id: "level-1-20260424",
    answers: {
      q01: "B",
      q02: "C",
      q03: "19910314",
    },
  };

  const graded = scoreSubmission(payload);

  assert.equal(graded.exam_id, "level-1-20260424");
  assert.equal(graded.total, 10);
  assert.equal(graded.results.length, 10);
  assert.equal(graded.score, 3);
});
