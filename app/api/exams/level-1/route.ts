import { NextResponse } from "next/server";

import { getLevel1PublicExam } from "@/lib/exams";

export function GET() {
  return NextResponse.json(getLevel1PublicExam());
}
