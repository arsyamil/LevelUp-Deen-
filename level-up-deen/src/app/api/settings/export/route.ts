import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { writeSystemAuditLog } from "@/lib/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function getUserRows(admin: ReturnType<typeof createSupabaseAdminClient>, table: string, userId: string) {
  const { data, error } = await admin.from(table).select("*").eq("user_id", userId);
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
  return data ?? [];
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("users_profile")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const [
      userStats,
      userTasks,
      dailyTaskLogs,
      waterLogs,
      financialCategories,
      financialTransactions,
      budgets,
      savingsGoals,
      userInventory,
      userAchievements,
      recoveryQuestLogs,
      syncQueueLogs,
      squadMemberships,
      leaderboardSnapshots,
      aiConversations,
      aiRecommendations,
      aiFinanceParseLogs,
      systemAuditLogs,
    ] = await Promise.all([
      getUserRows(admin, "user_stats", userId),
      getUserRows(admin, "user_tasks", userId),
      getUserRows(admin, "daily_task_logs", userId),
      getUserRows(admin, "water_logs", userId),
      getUserRows(admin, "financial_categories", userId),
      getUserRows(admin, "financial_transactions", userId),
      getUserRows(admin, "budgets", userId),
      getUserRows(admin, "savings_goals", userId),
      getUserRows(admin, "user_inventory", userId),
      getUserRows(admin, "user_achievements", userId),
      getUserRows(admin, "recovery_quest_logs", userId),
      getUserRows(admin, "sync_queue_logs", userId),
      getUserRows(admin, "squad_members", userId),
      getUserRows(admin, "leaderboard_snapshots", userId),
      getUserRows(admin, "ai_conversations", userId),
      getUserRows(admin, "ai_recommendations", userId),
      getUserRows(admin, "ai_finance_parse_logs", userId),
      admin
        .from("system_audit_logs")
        .select("*")
        .eq("actor_user_id", userId)
        .then(({ data, error }) => {
          if (error) throw new Error(`system_audit_logs: ${error.message}`);
          return data ?? [];
        }),
    ]);

    const exportedAt = new Date().toISOString();
    const exportPayload = {
      schemaVersion: 1,
      exportedAt,
      userId,
      profile,
      userStats,
      userTasks,
      dailyTaskLogs,
      waterLogs,
      financialCategories,
      financialTransactions,
      budgets,
      savingsGoals,
      userInventory,
      userAchievements,
      recoveryQuestLogs,
      syncQueueLogs,
      squadMemberships,
      leaderboardSnapshots,
      aiConversations,
      aiRecommendations,
      aiFinanceParseLogs,
      systemAuditLogs,
    };

    await writeSystemAuditLog({
      actorUserId: userId,
      action: "settings.data.export",
      entityType: "users_profile",
      entityId: userId,
      metadata: {
        exportedAt,
        schemaVersion: 1,
      },
    });

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="level-up-deen-export-${exportedAt.slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal export data" },
      { status: 500 }
    );
  }
}
