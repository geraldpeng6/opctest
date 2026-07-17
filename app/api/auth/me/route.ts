import { NextResponse } from "next/server";

import { AuthorizationError, getAuthMeResponse } from "@/lib/auth";
import { requireBearerToken } from "@/lib/request-auth";

export async function GET(request: Request) {
  try {
    const token = requireBearerToken(request);
    return NextResponse.json(await getAuthMeResponse(token));
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: "读取会话时出现意外错误。" }, { status: 500 });
  }
}
