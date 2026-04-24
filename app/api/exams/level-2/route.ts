import { NextResponse } from "next/server";

import { getLevel2PublicExam } from "@/lib/exams";

export function GET() {
  return NextResponse.json(getLevel2PublicExam());
}
