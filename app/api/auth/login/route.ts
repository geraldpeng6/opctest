import { NextResponse } from "next/server";

import { AuthError, loginWithName } from "@/lib/auth";
import type { AuthLoginPayload } from "@/lib/types";

export async function POST(request: Request) {
  let payload: AuthLoginPayload;

  try {
    payload = (await request.json()) as AuthLoginPayload;
  } catch {
    return NextResponse.json({ error: "请求正文不是有效结构化数据。" }, { status: 400 });
  }

  try {
    return NextResponse.json(await loginWithName(payload));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "认证时出现意外错误。" }, { status: 500 });
  }
}
