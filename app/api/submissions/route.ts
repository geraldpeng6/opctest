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
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  try {
    const token = requireBearerToken(request);
    const candidate = getCandidateSummaryFromToken(token);
    const attempt = getStoredAttempt(payload.attempt_id);

    if (!attempt) {
      return NextResponse.json({ error: "Unknown attempt_id." }, { status: 400 });
    }

    if (attempt.candidate_id !== candidate.candidate_id) {
      return NextResponse.json(
        { error: "This attempt does not belong to the authenticated candidate." },
        { status: 403 },
      );
    }

    const response = scoreSubmission(payload);
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
      { error: "Unexpected error while grading submission." },
      { status: 500 },
    );
  }
}
