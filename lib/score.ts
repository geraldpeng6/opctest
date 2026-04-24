import { getLevel1AnswerKey } from "@/lib/exams";
import { normalizeAnswer } from "@/lib/normalize";
import type {
  SubmissionPayload,
  SubmissionResponse,
  SubmissionResult,
} from "@/lib/types";

export class SubmissionValidationError extends Error {}

export function scoreSubmission(payload: SubmissionPayload): SubmissionResponse {
  const answerKey = getLevel1AnswerKey();

  if (!payload || typeof payload !== "object") {
    throw new SubmissionValidationError("Missing submission payload.");
  }

  if (payload.exam_id !== answerKey.exam_id) {
    throw new SubmissionValidationError("Unknown exam_id.");
  }

  if (!payload.answers || typeof payload.answers !== "object") {
    throw new SubmissionValidationError("answers must be an object.");
  }

  const results: SubmissionResult[] = Object.entries(answerKey.answers).map(
    ([id, expected]) => {
      const type = answerKey.normalizers[id];
      const received = payload.answers[id] ?? "";
      const normalizedReceived = normalizeAnswer(received, type);
      const normalizedExpected = normalizeAnswer(expected, type);

      return {
        id,
        correct: normalizedReceived === normalizedExpected,
        expected,
        received: typeof received === "string" ? received.trim() : "",
      };
    },
  );

  const score = results.filter((entry) => entry.correct).length;

  return {
    exam_id: answerKey.exam_id,
    score,
    total: results.length,
    accuracy: results.length === 0 ? 0 : score / results.length,
    results,
  };
}
