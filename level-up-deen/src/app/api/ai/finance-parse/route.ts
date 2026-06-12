import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { parseNaturalTransactionAI } from "@/lib/finance-ai";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { note?: string };
  if (!body.note?.trim()) {
    return NextResponse.json({ error: "note wajib diisi" }, { status: 400 });
  }

  const result = await parseNaturalTransactionAI(body.note.trim());
  return NextResponse.json(result);
}
