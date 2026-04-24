import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

import { getAnswerKeyByExamId, getPublicExam } from "@/lib/exams";
import { ensureRuntimeDir } from "@/lib/runtime-paths";
import { persistFinalLevelSubmission, getFinalSubmission } from "@/lib/results";
import type {
  CandidateSummary,
  ExamLevel,
  PublicExam,
  Question,
  StoredAttempt,
  SubmissionRecord,
} from "@/lib/types";

const DEFAULT_TIME_LIMIT_SEC = 30 * 60;

export class AttemptAlreadySubmittedError extends Error {}
export class LevelAlreadyFinalizedError extends Error {
  result?: SubmissionRecord;

  constructor(message: string, result?: SubmissionRecord) {
    super(message);
    this.result = result;
  }
}

function attemptsDir() {
  return ensureRuntimeDir("attempts");
}

function recordsDir() {
  return ensureRuntimeDir("records");
}

function activeAttemptPath(candidateId: string, level: ExamLevel) {
  return join(attemptsDir(), `${candidateId}__${level}.json`);
}

function finalAttemptPath(attemptId: string) {
  return join(recordsDir(), `${attemptId}.final.json`);
}

function shuffleArray<T>(items: T[], random: () => number) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function letterToIndex(value: string) {
  return value.trim().toUpperCase().charCodeAt(0) - 65;
}

function indexToLetter(index: number) {
  return String.fromCharCode(65 + index);
}

function randomizeQuestion(
  question: Question,
  expected: string,
  random: () => number,
): { question: Question; expected: string } {
  if (question.type !== "single_choice" || !question.options) {
    return { question: structuredClone(question), expected };
  }

  const originalCorrectOption = question.options[letterToIndex(expected)];
  const randomizedOptions = shuffleArray(question.options, random);
  const randomizedExpected = indexToLetter(
    randomizedOptions.findIndex((option) => option === originalCorrectOption),
  );

  return {
    question: {
      ...structuredClone(question),
      options: randomizedOptions,
    },
    expected: randomizedExpected,
  };
}

function publicExamFromAttempt(attempt: StoredAttempt, title: string): PublicExam {
  return {
    level: attempt.level,
    exam_id: attempt.exam_id,
    title,
    time_limit_sec: attempt.time_limit_sec,
    submit_url: "/api/submissions",
    questions: attempt.questions,
    attempt_id: attempt.attempt_id,
    started_at: attempt.started_at,
    expires_at: attempt.expires_at,
    shuffled: true,
    candidate_name: attempt.candidate_name ?? undefined,
  };
}

export function getStoredAttemptByCandidate(candidateId: string, level: ExamLevel) {
  const filePath = activeAttemptPath(candidateId, level);
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(readFileSync(filePath, "utf8")) as StoredAttempt;
}

export function getStoredAttemptById(attemptId: string) {
  return loadAllAttempts().find((attempt) => attempt.attempt_id === attemptId) ?? null;
}

function loadAllAttempts() {
  return readdirSync(attemptsDir())
    .filter((file: string) => file.endsWith(".json"))
    .map((file: string) =>
      JSON.parse(readFileSync(join(attemptsDir(), file), "utf8")) as StoredAttempt,
    );
}

export function getStoredAttempt(attemptId: string) {
  return getStoredAttemptById(attemptId);
}

export function clearStoredAttempt(attempt: StoredAttempt) {
  const filePath = activeAttemptPath(attempt.candidate_id, attempt.level);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

export function createSubmissionRecordId() {
  return randomUUID();
}

export function appendSubmissionRecord(record: SubmissionRecord) {
  const filePath = join(recordsDir(), "submissions.jsonl");
  appendFileSync(filePath, `${JSON.stringify(record)}\n`);
}

export function persistFinalSubmission(record: SubmissionRecord) {
  try {
    persistFinalLevelSubmission(record);
    writeFileSync(finalAttemptPath(record.attempt_id), JSON.stringify(record, null, 2), {
      flag: "wx",
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "EEXIST") {
      throw new AttemptAlreadySubmittedError("This exam attempt has already been submitted.");
    }
    throw error;
  }

  appendSubmissionRecord(record);
}

function finalizeExpiredAttempt(attempt: StoredAttempt, nowMs: number) {
  const existing = getFinalSubmission(attempt.candidate_id, attempt.level);
  if (existing) {
    throw new LevelAlreadyFinalizedError("This level has already been finalized.", existing);
  }

  const record: SubmissionRecord = {
    attempt_id: attempt.attempt_id,
    candidate_id: attempt.candidate_id,
    candidate_name: attempt.candidate_name,
    exam_id: attempt.exam_id,
    level: attempt.level,
    status: "absent",
    score: 0,
    total: attempt.questions.length,
    accuracy: 0,
    duration_sec: Math.max(
      0,
      Math.floor((nowMs - new Date(attempt.started_at).getTime()) / 1000),
    ),
    started_at: attempt.started_at,
    submitted_at: new Date(nowMs).toISOString(),
    expires_at: attempt.expires_at,
    record_id: createSubmissionRecordId(),
    answers: {},
    results: attempt.questions.map((question) => ({
      id: question.id,
      correct: false,
      expected: attempt.answer_key[question.id],
      received: "",
    })),
  };

  persistFinalSubmission(record);
  unlinkSync(activeAttemptPath(attempt.candidate_id, attempt.level));
  throw new LevelAlreadyFinalizedError(
    "This level timed out and has been finalized as absent.",
    record,
  );
}

export function createOrLoadAttemptForCandidate(
  level: ExamLevel,
  candidate: CandidateSummary,
  nowMs = Date.now(),
  random: () => number = Math.random,
): PublicExam {
  const existingFinal = getFinalSubmission(candidate.candidate_id, level);
  if (existingFinal) {
    throw new LevelAlreadyFinalizedError("This level has already been finalized.", existingFinal);
  }

  const activeAttempt = getStoredAttemptByCandidate(candidate.candidate_id, level);
  const exam = getPublicExam(level);
  if (!exam) {
    throw new Error(`Unknown level: ${level}`);
  }

  if (activeAttempt) {
    if (nowMs > new Date(activeAttempt.expires_at).getTime()) {
      finalizeExpiredAttempt(activeAttempt, nowMs);
    }
    return publicExamFromAttempt(activeAttempt, exam.title);
  }

  const answerKey = getAnswerKeyByExamId(exam.exam_id);
  if (!answerKey) {
    throw new Error(`Missing answer key for ${exam.exam_id}`);
  }

  const randomizedQuestions = shuffleArray(exam.questions, random).map((question) =>
    randomizeQuestion(question, answerKey.answers[question.id], random),
  );

  const attemptId = randomUUID();
  const attempt: StoredAttempt = {
    attempt_id: attemptId,
    candidate_id: candidate.candidate_id,
    candidate_name: candidate.name,
    level,
    exam_id: exam.exam_id,
    started_at: new Date(nowMs).toISOString(),
    expires_at: new Date(nowMs + DEFAULT_TIME_LIMIT_SEC * 1000).toISOString(),
    time_limit_sec: DEFAULT_TIME_LIMIT_SEC,
    questions: randomizedQuestions.map((entry) => entry.question),
    answer_key: Object.fromEntries(randomizedQuestions.map((entry) => [entry.question.id, entry.expected])),
    normalizers: answerKey.normalizers,
  };

  writeFileSync(activeAttemptPath(candidate.candidate_id, level), JSON.stringify(attempt, null, 2));
  return publicExamFromAttempt(attempt, exam.title);
}

export function getAttemptTimeLimitSec() {
  return DEFAULT_TIME_LIMIT_SEC;
}
