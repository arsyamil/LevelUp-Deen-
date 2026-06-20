import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("ziswaf_records")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, amount, date, recipient, note, accountId } = body;

  if (!type || !amount || !date) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // 1. Insert ke ziswaf_records
  const { data: record, error: recordError } = await admin
    .from("ziswaf_records")
    .insert({
      user_id: userId,
      type,
      amount,
      date,
      recipient,
      note,
    })
    .select()
    .single();

  if (recordError) {
    return NextResponse.json({ error: recordError.message }, { status: 500 });
  }

  // 2. Jika accountId diberikan, insert juga ke financial_transactions agar saldo terpotong
  if (accountId) {
    // Kategori default untuk ZISWAF adalah expense ibadah
    const { error: txError } = await admin
      .from("financial_transactions")
      .insert({
        user_id: userId,
        account_id: accountId,
        type: "expense",
        amount,
        category: "Ibadah dan sedekah", // Pastikan kategori ini umum/bisa diterima
        date,
        note: `ZISWAF (${type}) - ${recipient || "Hamba Allah"} ${note ? "- " + note : ""}`,
      });

    if (txError) {
      console.error("Gagal menambahkan transaksi ZISWAF ke ledger:", txError);
      // Kita tidak menggagalkan seluruh request, tapi mencatat log
    }
  }

  return NextResponse.json({ success: true, data: record });
}
