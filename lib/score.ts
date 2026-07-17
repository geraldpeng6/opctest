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

export async function scoreSubmission(
  payload: SubmissionPayload,
  nowMs = Date.now(),
): Promise<SubmissionResponse> {
  if (!payload || typeof payload !== "object") {
    throw new SubmissionValidationError("缺少提交载荷。");
  }
  if (!payload.attempt_id || typeof payload.attempt_id !== "string") {
    throw new SubmissionValidationError("必须提供答题记录编号。");
  }
  if (!payload.answers || typeof payload.answers !== "object") {
    throw new SubmissionValidationError("答案必须是对象。");
  }

  const attempt = await getStoredAttempt(payload.attempt_id);
  if (!attempt) {
    throw new SubmissionValidationError("未知答题记录编号。");
  }
  if (attempt.exam_id !== payload.exam_id) {
    throw new SubmissionValidationError("答题记录编号与试卷编号不匹配。");
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
    return {
      id: question.id,
      correct:
        !timedOut &&
        normalizeAnswer(received, type) === normalizeAnswer(expected, type),
      expected,
      received: typeof received === "string" ? received.trim() : "",
    };
  });

  const score = timedOut ? 0 : results.filter((entry) => entry.correct).length;
  const response: SubmissionResponse = {
    attempt_id: attempt.attempt_id,
    exam_id: attempt.exam_id,
    status: timedOut ? "absent" : "submitted",
    score,
    total: results.length,
    accuracy: results.length === 0 ? 0 : score / results.length,
    duration_sec: durationSec,
    started_at: attempt.started_at,
    submitted_at: new Date(nowMs).toISOString(),
    expires_at: attempt.expires_at,
    record_id: createSubmissionRecordId(),
    results,
  };

  await persistFinalSubmission({
    ...response,
    candidate_id: attempt.candidate_id,
    candidate_name: attempt.candidate_name,
    level: attempt.level,
    answers: payload.answers,
  });
  await clearStoredAttempt(attempt);
  return response;
}
