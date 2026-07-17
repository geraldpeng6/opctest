import { NextResponse } from "next/server";

import { getInventoryMovementsPage } from "@/lib/level3-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? "start";
  const payload = getInventoryMovementsPage(cursor);

  if (!payload) {
    return NextResponse.json({ error: "未知游标。" }, { status: 404 });
  }

  return NextResponse.json(payload);
}
