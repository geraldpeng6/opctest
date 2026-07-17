import { NextResponse } from "next/server";

import { getSupportCases } from "@/lib/level3-data";

export function GET() {
  return NextResponse.json(getSupportCases());
}
