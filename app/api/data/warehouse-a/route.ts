import { NextResponse } from "next/server";

const warehouseA = {
  items: [
    { sku: "W-01", in_stock: 14 },
    { sku: "W-02", in_stock: 22 },
    { sku: "W-03", in_stock: 19 },
  ],
};

export function GET() {
  return NextResponse.json(warehouseA);
}
