import { NextResponse } from "next/server";

import { AuthorizationError, getCandidateSummaryFromToken } from "@/lib/auth";
import { getStoredAttempt } from "@/lib/attempts";
import { requireBearerToken } from "@/lib/request-auth";
import {
  AttemptAlreadySubmittedError,
  LevelAlreadyFinalizedError,
  scoreSubmission,
  SubmissionValidationError,
} from "@/lib/score";
import type { SubmissionPayload } from "@/lib/types";

export async function POST(request: Request) {
  let payload: SubmissionPayload;

  try {
    payload = (await request.json()) as SubmissionPayload;
  } catch {
    return NextResponse.json(
      { error: "请求正文不是有效结构化数据。" },
      { status: 400 },
    );
  }

  try {
    const token = requireBearerToken(request);
    const candidate = await getCandidateSummaryFromToken(token);
    const attempt = await getStoredAttempt(payload.attempt_id);

    if (!attempt) {
      return NextResponse.json({ error: "未知答题记录编号。" }, { status: 400 });
    }

    if (attempt.candidate_id !== candidate.candidate_id) {
      return NextResponse.json(
        { error: "这次答题记录不属于当前认证考生。" },
        { status: 403 },
      );
    }

    const response = await scoreSubmission(payload);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AttemptAlreadySubmittedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof LevelAlreadyFinalizedError) {
      return NextResponse.json(
        { error: error.message, result: error.result ?? null },
        { status: 409 },
      );
    }

    if (error instanceof SubmissionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "判分时出现意外错误。" },
      { status: 500 },
    );
  }
}
