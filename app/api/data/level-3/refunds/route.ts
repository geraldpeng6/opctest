import { NextResponse } from "next/server";

import { getRefundsPage } from "@/lib/level3-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const payload = getRefundsPage(page);

  if (!payload) {
    return NextResponse.json({ error: "未知页码。" }, { status: 404 });
  }

  return NextResponse.json(payload);
}
