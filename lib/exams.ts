import level1Answers from "@/data/exams/level-1.answers.json";
import level1Public from "@/data/exams/level-1.public.json";

import type { AnswerKey, PublicExam } from "@/lib/types";

function assertMatchingExamIds(publicExam: PublicExam, answerKey: AnswerKey) {
  if (publicExam.exam_id !== answerKey.exam_id) {
    throw new Error("Public exam and answer key exam IDs do not match.");
  }
}

assertMatchingExamIds(level1Public as PublicExam, level1Answers as AnswerKey);

export function getLevel1PublicExam(): PublicExam {
  return structuredClone(level1Public as PublicExam);
}

export function getLevel1AnswerKey(): AnswerKey {
  return structuredClone(level1Answers as AnswerKey);
}
