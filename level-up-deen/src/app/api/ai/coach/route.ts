import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { generateCoachAdvice } from "@/lib/ai-provider";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json().catch(() => ({ message: "" }));

    const admin = createSupabaseAdminClient();

    // 1. Get user profile & stats
    const [{ data: profile }, { data: stats }] = await Promise.all([
      admin.from("users_profile").select("full_name").eq("id", userId).maybeSingle(),
      admin.from("user_stats").select("level, coins").eq("user_id", userId).maybeSingle(),
    ]);

    // 2. Get uncompleted tasks count
    const { count: tasksRemaining } = await admin
      .from("study_assignments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_completed", false);

    // 3. Get financial summary for current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: txs } = await admin
      .from("financial_transactions")
      .select("type, amount")
      .eq("user_id", userId)
      .like("transaction_date", `${currentMonth}%`);

    let income = 0;
    let expense = 0;
    if (txs) {
      for (const tx of txs) {
        if (tx.type === "income") income += tx.amount;
        if (tx.type === "expense") expense += tx.amount;
      }
    }
    const savings = income - expense;

    // Build context
    const context = {
      userName: profile?.full_name || "Sobat",
      level: stats?.level || 1,
      tasksRemaining: tasksRemaining || 0,
      savings,
      expense,
    };

    // Generate AI response
    const reply = await generateCoachAdvice(context, message);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Coach Error:", error);
    return NextResponse.json(
      { error: "Gagal menghubungkan ke AI Coach. Pastikan API key sudah diatur." },
      { status: 500 }
    );
  }
}
