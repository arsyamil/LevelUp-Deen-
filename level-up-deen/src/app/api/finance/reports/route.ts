import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startDate = request.nextUrl.searchParams.get("start");
  const endDate = request.nextUrl.searchParams.get("end");

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Parameter start dan end dibutuhkan" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("financial_transactions")
    .select("id, type, amount, note, transaction_date, category:category_id(name)")
    .eq("user_id", userId)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .order("transaction_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const txs = data || [];
  let income = 0;
  let expense = 0;
  
  const byCategory: Record<string, { income: number; expense: number }> = {};

  txs.forEach((tx) => {
    const amt = Number(tx.amount);
    const cat = (tx.category as any)?.name || "Lainnya";
    
    if (!byCategory[cat]) byCategory[cat] = { income: 0, expense: 0 };

    if (tx.type === "income") {
      income += amt;
      byCategory[cat].income += amt;
    } else if (tx.type === "expense") {
      expense += amt;
      byCategory[cat].expense += amt;
    }
  });

  return NextResponse.json({
    transactions: txs.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      note: t.note,
      transactionDate: t.transaction_date,
      category: (t.category as any)?.name || "Lainnya"
    })),
    summary: { income, expense, net: income - expense },
    categorySummary: Object.entries(byCategory).map(([cat, vals]) => ({
      category: cat,
      income: vals.income,
      expense: vals.expense
    })).sort((a, b) => (b.income + b.expense) - (a.income + a.expense))
  });
}
