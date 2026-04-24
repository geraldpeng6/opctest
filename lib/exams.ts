import level1Answers from "@/data/exams/level-1.answers.json";
import level1Public from "@/data/exams/level-1.public.json";
import level2Answers from "@/data/exams/level-2.answers.json";
import level2Public from "@/data/exams/level-2.public.json";

import type { AnswerKey, PublicExam } from "@/lib/types";

function assertMatchingExamIds(publicExam: PublicExam, answerKey: AnswerKey) {
  if (publicExam.exam_id !== answerKey.exam_id) {
    throw new Error("Public exam and answer key exam IDs do not match.");
  }
}

assertMatchingExamIds(level1Public as PublicExam, level1Answers as AnswerKey);
assertMatchingExamIds(level2Public as PublicExam, level2Answers as AnswerKey);

const examMap: Record<string, PublicExam> = {
  "level-1": level1Public as PublicExam,
  "level-2": level2Public as PublicExam,
};

const answerKeyMap: Record<string, AnswerKey> = {
  "level-1-20260424": level1Answers as AnswerKey,
  "level-2-20260424": level2Answers as AnswerKey,
};

export function getLevel1PublicExam(): PublicExam {
  return structuredClone(level1Public as PublicExam);
}

export function getLevel1AnswerKey(): AnswerKey {
  return structuredClone(level1Answers as AnswerKey);
}

export function getLevel2PublicExam(): PublicExam {
  return structuredClone(level2Public as PublicExam);
}

export function getLevel2AnswerKey(): AnswerKey {
  return structuredClone(level2Answers as AnswerKey);
}

export function getPublicExam(level: string): PublicExam | null {
  const exam = examMap[level];
  return exam ? structuredClone(exam) : null;
}

export function getAnswerKeyByExamId(examId: string): AnswerKey | null {
  const answerKey = answerKeyMap[examId];
  return answerKey ? structuredClone(answerKey) : null;
}
