import level1Answers from "@/data/exams/level-1.answers.json";
import level1Public from "@/data/exams/level-1.public.json";
import level2Answers from "@/data/exams/level-2.answers.json";
import level2Public from "@/data/exams/level-2.public.json";
import level3Answers from "@/data/exams/level-3.answers.json";
import level3Public from "@/data/exams/level-3.public.json";
import level4Answers from "@/data/exams/level-4.answers.json";
import level4Public from "@/data/exams/level-4.public.json";
import level5Answers from "@/data/exams/level-5.answers.json";
import level5Public from "@/data/exams/level-5.public.json";
import level6Answers from "@/data/exams/level-6.answers.json";
import level6Public from "@/data/exams/level-6.public.json";
import level7Answers from "@/data/exams/level-7.answers.json";
import level7Public from "@/data/exams/level-7.public.json";
import level8Answers from "@/data/exams/level-8.answers.json";
import level8Public from "@/data/exams/level-8.public.json";
import level9Answers from "@/data/exams/level-9.answers.json";
import level9Public from "@/data/exams/level-9.public.json";
import level10Answers from "@/data/exams/level-10.answers.json";
import level10Public from "@/data/exams/level-10.public.json";

import type { AnswerKey, PublicExam } from "@/lib/types";

function assertMatchingExamIds(publicExam: PublicExam, answerKey: AnswerKey) {
  if (publicExam.exam_id !== answerKey.exam_id) {
    throw new Error("公开试卷和答案键的试卷编号不一致。");
  }
}

assertMatchingExamIds(level1Public as PublicExam, level1Answers as AnswerKey);
assertMatchingExamIds(level2Public as PublicExam, level2Answers as AnswerKey);
assertMatchingExamIds(level3Public as PublicExam, level3Answers as AnswerKey);
assertMatchingExamIds(level4Public as PublicExam, level4Answers as AnswerKey);
assertMatchingExamIds(level5Public as PublicExam, level5Answers as AnswerKey);
assertMatchingExamIds(level6Public as PublicExam, level6Answers as AnswerKey);
assertMatchingExamIds(level7Public as PublicExam, level7Answers as AnswerKey);
assertMatchingExamIds(level8Public as PublicExam, level8Answers as AnswerKey);
assertMatchingExamIds(level9Public as PublicExam, level9Answers as AnswerKey);
assertMatchingExamIds(level10Public as PublicExam, level10Answers as AnswerKey);

const examMap: Record<string, PublicExam> = {
  "level-1": level1Public as PublicExam,
  "level-2": level2Public as PublicExam,
  "level-3": level3Public as PublicExam,
  "level-4": level4Public as PublicExam,
  "level-5": level5Public as PublicExam,
  "level-6": level6Public as PublicExam,
  "level-7": level7Public as PublicExam,
  "level-8": level8Public as PublicExam,
  "level-9": level9Public as PublicExam,
  "level-10": level10Public as PublicExam,
};

const answerKeyMap: Record<string, AnswerKey> = {
  "level-1-20260424": level1Answers as AnswerKey,
  "level-2-20260424": level2Answers as AnswerKey,
  "level-3-20260425": level3Answers as AnswerKey,
  "level-4-20260707": level4Answers as AnswerKey,
  "level-5-20260707": level5Answers as AnswerKey,
  "level-6-20260707": level6Answers as AnswerKey,
  "level-7-20260707": level7Answers as AnswerKey,
  "level-8-20260707": level8Answers as AnswerKey,
  "level-9-20260707": level9Answers as AnswerKey,
  "level-10-20260707": level10Answers as AnswerKey,
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

export function getLevel3PublicExam(): PublicExam {
  return structuredClone(level3Public as PublicExam);
}

export function getLevel3AnswerKey(): AnswerKey {
  return structuredClone(level3Answers as AnswerKey);
}

export function getLevel4PublicExam(): PublicExam {
  return structuredClone(level4Public as PublicExam);
}

export function getLevel4AnswerKey(): AnswerKey {
  return structuredClone(level4Answers as AnswerKey);
}

export function getLevel5PublicExam(): PublicExam {
  return structuredClone(level5Public as PublicExam);
}

export function getLevel5AnswerKey(): AnswerKey {
  return structuredClone(level5Answers as AnswerKey);
}

export function getLevel6PublicExam(): PublicExam {
  return structuredClone(level6Public as PublicExam);
}

export function getLevel6AnswerKey(): AnswerKey {
  return structuredClone(level6Answers as AnswerKey);
}

export function getLevel7PublicExam(): PublicExam {
  return structuredClone(level7Public as PublicExam);
}

export function getLevel7AnswerKey(): AnswerKey {
  return structuredClone(level7Answers as AnswerKey);
}

export function getLevel8PublicExam(): PublicExam {
  return structuredClone(level8Public as PublicExam);
}

export function getLevel8AnswerKey(): AnswerKey {
  return structuredClone(level8Answers as AnswerKey);
}

export function getLevel9PublicExam(): PublicExam {
  return structuredClone(level9Public as PublicExam);
}

export function getLevel9AnswerKey(): AnswerKey {
  return structuredClone(level9Answers as AnswerKey);
}

export function getLevel10PublicExam(): PublicExam {
  return structuredClone(level10Public as PublicExam);
}

export function getLevel10AnswerKey(): AnswerKey {
  return structuredClone(level10Answers as AnswerKey);
}

export function getPublicExam(level: string): PublicExam | null {
  const exam = examMap[level];
  return exam ? structuredClone(exam) : null;
}

export function getAnswerKeyByExamId(examId: string): AnswerKey | null {
  const answerKey = answerKeyMap[examId];
  return answerKey ? structuredClone(answerKey) : null;
}
