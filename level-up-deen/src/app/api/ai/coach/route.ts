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

    // 4. Get next assignment
    const { data: nextAssigment } = await admin
      .from("study_assignments")
      .select("title, deadline_at")
      .eq("user_id", userId)
      .eq("is_completed", false)
      .order("deadline_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    // 5. Get latest achievement
    const { data: latestAchievement } = await admin
      .from("user_achievements")
      .select("achievements(name)")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 6. Get squad name
    const { data: squad } = await admin
      .from("squad_members")
      .select("squad_groups(name)")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    // 7. Get last 7 days of daily_task_logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentLogs } = await admin
      .from("daily_task_logs")
      .select("log_date, status, user_tasks(name, category)")
      .eq("user_id", userId)
      .gte("log_date", sevenDaysAgo.toISOString().slice(0, 10));

    let completedTasks = 0;
    let missedTasks = 0;
    const missedWorship: string[] = [];
    if (recentLogs) {
      for (const log of recentLogs) {
        if (log.status === "completed") {
          completedTasks++;
        } else if (log.status === "missed" || log.status === "skipped") {
          missedTasks++;
          const taskData = log.user_tasks as { category?: string; name?: string } | null;
          if (taskData?.category === "Ibadah" || taskData?.category === "Spiritual") {
            missedWorship.push(taskData.name ?? "Ibadah");
          }
        }
      }
    }

    // Build context
    const context = {
      userName: profile?.full_name || "Sobat",
      level: stats?.level || 1,
      tasksRemaining: tasksRemaining || 0,
      savings,
      expense,
      nextAssignment: nextAssigment ? `${nextAssigment.title} (Deadline: ${new Date(nextAssigment.deadline_at).toLocaleDateString("id-ID")})` : undefined,
      latestAchievement: (latestAchievement?.achievements as unknown as { name: string })?.name ?? undefined,
      squadName: (squad?.squad_groups as unknown as { name: string })?.name ?? undefined,
      recentPerformance: {
        completedTasks,
        missedTasks,
        missedWorshipSummary: missedWorship.length > 0 ? missedWorship.join(", ") : "Tidak ada ibadah tertinggal",
      }
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
