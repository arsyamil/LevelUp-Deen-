import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "level-up-deen",
    version: "1.0.0-mvp-foundation",
    timestamp: new Date().toISOString(),
  });
}
