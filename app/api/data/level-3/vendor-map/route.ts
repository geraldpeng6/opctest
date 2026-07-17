import { NextResponse } from "next/server";

import { getVendorMap } from "@/lib/level3-data";

export function GET() {
  return NextResponse.json(getVendorMap());
}
