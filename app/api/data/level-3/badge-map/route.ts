import { NextResponse } from "next/server";

import { getBadgeMap } from "@/lib/level3-data";

export function GET() {
  return NextResponse.json(getBadgeMap());
}
