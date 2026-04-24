import { NextResponse } from "next/server";

import { getLeaderboards } from "@/lib/leaderboard";

export function GET() {
  return NextResponse.json(getLeaderboards());
}
