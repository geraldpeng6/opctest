import { NextResponse } from "next/server";

import { getLeaderboards } from "@/lib/leaderboard";

export async function GET() {
  return NextResponse.json(await getLeaderboards());
}
