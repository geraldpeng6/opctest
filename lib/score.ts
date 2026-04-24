import {
  AttemptAlreadySubmittedError,
  LevelAlreadyFinalizedError,
  clearStoredAttempt,
  createSubmissionRecordId,
  getStoredAttempt,
  persistFinalSubmission,
} from "@/lib/attempts";
import { normalizeAnswer } from "@/lib/normalize";
import type {
  SubmissionPayload,
  SubmissionResponse,
  SubmissionResult,
} from "@/lib/types";

export class SubmissionValidationError extends Error {}
export { AttemptAlreadySubmittedError, LevelAlreadyFinalizedError };

export function scoreSubmission(
  payload: SubmissionPayload,
  nowMs = Date.now(),
): SubmissionResponse {
  if (!payload || typeof payload !== "object") {
    throw new SubmissionValidationError("Missing submission payload.");
  }

  if (!payload.attempt_id || typeof payload.attempt_id !== "string") {
    throw new SubmissionValidationError("attempt_id is required.");
  }

  if (!payload.answers || typeof payload.answers !== "object") {
    throw new SubmissionValidationError("answers must be an object.");
  }

  const attempt = getStoredAttempt(payload.attempt_id);

  if (!attempt) {
    throw new SubmissionValidationError("Unknown attempt_id.");
  }

  if (attempt.exam_id !== payload.exam_id) {
    throw new SubmissionValidationError("attempt_id does not match exam_id.");
  }

  const timedOut = nowMs > new Date(attempt.expires_at).getTime();
  const durationSec = Math.max(
    0,
    Math.floor((nowMs - new Date(attempt.started_at).getTime()) / 1000),
  );
  const results: SubmissionResult[] = attempt.questions.map((question) => {
      const expected = attempt.answer_key[question.id];
      const type = attempt.normalizers[question.id];
      const received = payload.answers[question.id] ?? "";
      const normalizedReceived = normalizeAnswer(received, type);
      const normalizedExpected = normalizeAnswer(expected, type);

      return {
        id: question.id,
        correct: !timedOut && normalizedReceived === normalizedExpected,
        expected,
        received: typeof received === "string" ? received.trim() : "",
      };
    });

  const score = timedOut ? 0 : results.filter((entry) => entry.correct).length;
  const recordId = createSubmissionRecordId();
  const submittedAt = new Date(nowMs).toISOString();

  const response: SubmissionResponse = {
    attempt_id: attempt.attempt_id,
    exam_id: attempt.exam_id,
    status: timedOut ? "absent" : "submitted",
    score,
    total: results.length,
    accuracy: results.length === 0 ? 0 : score / results.length,
    duration_sec: durationSec,
    started_at: attempt.started_at,
    submitted_at: submittedAt,
    expires_at: attempt.expires_at,
    record_id: recordId,
    results,
  };

  persistFinalSubmission({
    ...response,
    candidate_id: attempt.candidate_id,
    candidate_name: attempt.candidate_name,
    level: attempt.level,
    answers: payload.answers,
  });
  clearStoredAttempt(attempt);

  return response;
}
