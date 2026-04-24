import { NextResponse } from "next/server";

import { AuthError, loginWithCode } from "@/lib/auth";
import type { AuthLoginPayload } from "@/lib/types";

export async function POST(request: Request) {
  let payload: AuthLoginPayload;

  try {
    payload = (await request.json()) as AuthLoginPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    return NextResponse.json(loginWithCode(payload));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unexpected authentication error." }, { status: 500 });
  }
}
