import { NextResponse } from "next/server";

import { AuthorizationError, ensureLevelAccess } from "@/lib/auth";
import { createOrLoadAttemptForCandidate, LevelAlreadyFinalizedError } from "@/lib/attempts";
import { requireBearerToken } from "@/lib/request-auth";

export function GET(request: Request) {
  try {
    const token = requireBearerToken(request);
    const candidate = ensureLevelAccess(token, "level-7");
    return NextResponse.json(createOrLoadAttemptForCandidate("level-7", candidate));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof LevelAlreadyFinalizedError) {
      return NextResponse.json(
        { error: error.message, result: error.result ?? null },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "读取试卷时出现意外错误。" }, { status: 500 });
  }
}
