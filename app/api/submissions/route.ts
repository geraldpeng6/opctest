import { NextResponse } from "next/server";

import { scoreSubmission, SubmissionValidationError } from "@/lib/score";
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
    const response = scoreSubmission(payload);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof SubmissionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unexpected error while grading submission." },
      { status: 500 },
    );
  }
}
