import { NextRequest, NextResponse } from "next/server";
import { calculateLevelFromTotalExp } from "@/lib/gamification";

export async function GET(request: NextRequest) {
  const expParam = request.nextUrl.searchParams.get("totalExp") ?? "0";
  const totalExp = Number(expParam);

  if (Number.isNaN(totalExp) || totalExp < 0) {
    return NextResponse.json(
      { error: "totalExp harus berupa angka non-negatif" },
      { status: 400 }
    );
  }

  const preview = calculateLevelFromTotalExp(totalExp);
  return NextResponse.json({ totalExp, ...preview });
}
