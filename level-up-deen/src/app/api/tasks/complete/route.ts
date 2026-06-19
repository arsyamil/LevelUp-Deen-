import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { calculateLevelFromTotalExp } from "@/lib/gamification";
import { formatDateInTimeZone } from "@/lib/date";
import { getCurrentUserId } from "@/lib/auth";
import { writeSystemAuditLog } from "@/lib/audit";

const validStatus = ["completed", "pending", "skipped"] as const;

type TaskStatus = (typeof validStatus)[number];

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const taskId = String(body.taskId ?? "").trim();
  const status = String(body.status ?? "").trim() as TaskStatus;

  if (!taskId) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }
  if (!validStatus.includes(status)) {
    return NextResponse.json({ error: "Invalid task status" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const today = formatDateInTimeZone();

  const { data: existingTask, error: taskError } = await admin
    .from("user_tasks")
    .select("id, name, category")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 500 });
  }
  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const { data: existingLog, error: existingLogError } = await admin
    .from("daily_task_logs")
    .select("status, exp_awarded, coin_awarded")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .eq("log_date", today)
    .maybeSingle();

  if (existingLogError) {
    return NextResponse.json({ error: existingLogError.message }, { status: 500 });
  }

  // If completed, compute rewards and update user_stats
  let expAward = 0;
  let coinAward = 0;
  const alreadyRewarded =
    existingLog?.status === "completed" ||
    Number(existingLog?.exp_awarded ?? 0) > 0 ||
    Number(existingLog?.coin_awarded ?? 0) > 0;

  let initialLevel = 1;

  if (status === "completed" && !alreadyRewarded) {
    // fetch task reward values
    const { data: taskRow, error: taskRowError } = await admin
      .from("user_tasks")
      .select("exp_reward, coin_reward, category")
      .eq("id", taskId)
      .eq("user_id", userId)
      .maybeSingle();

    if (taskRowError) {
      return NextResponse.json({ error: taskRowError.message }, { status: 500 });
    }

    expAward = Number(taskRow?.exp_reward ?? 0);
    coinAward = Number(taskRow?.coin_reward ?? 0);

    // update or insert user_stats
    const { data: statsData, error: statsError } = await admin
      .from("user_stats")
      .select("id, level, total_exp, current_exp, next_level_exp, coins")
      .eq("user_id", userId)
      .maybeSingle();

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }

    const newTotalExp = (statsData?.total_exp ?? 0) + expAward;
    const preview = calculateLevelFromTotalExp(newTotalExp);
    initialLevel = statsData?.level ?? 1;

    if (statsData) {
      const { error: updateStatsError } = await admin
        .from("user_stats")
        .update({
          total_exp: newTotalExp,
          current_exp: preview.currentExp,
          next_level_exp: preview.nextLevelExp,
          level: preview.level,
          rank: preview.rank,
          coins: Number(statsData.coins ?? 0) + coinAward,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateStatsError) {
        return NextResponse.json({ error: updateStatsError.message }, { status: 500 });
      }
    } else {
      // create initial stats row
      const { error: insertStatsError } = await admin.from("user_stats").insert({
        user_id: userId,
        level: preview.level,
        rank: preview.rank,
        total_exp: newTotalExp,
        current_exp: preview.currentExp,
        next_level_exp: preview.nextLevelExp,
        coins: coinAward,
      });

      if (insertStatsError) {
        return NextResponse.json({ error: insertStatsError.message }, { status: 500 });
      }
    }
    // After updating stats, check for achievements to unlock
    try {
      const checks: Array<{ code: string; name: string; description: string; match: (s: Record<string, unknown>) => boolean; rewardExp?: number; rewardCoin?: number }> = [
        {
          code: "prayer_streak_3",
          name: "Prayer Streak 3",
          description: "Complete 3-day prayer streak",
          match: (s) => Number(s["prayer_streak"] ?? 0) >= 3,
          rewardExp: 20,
          rewardCoin: 5,
        },
        {
          code: "prayer_streak_7",
          name: "Prayer Streak 7",
          description: "Complete 7-day prayer streak",
          match: (s) => Number(s["prayer_streak"] ?? 0) >= 7,
          rewardExp: 60,
          rewardCoin: 20,
        },
        {
          code: "full_quest_streak_3",
          name: "Full Quest Streak 3",
          description: "Complete full quest streak 3 days",
          match: (s) => Number(s["full_quest_streak"] ?? 0) >= 3,
          rewardExp: 30,
          rewardCoin: 10,
        },
        {
          code: "total_exp_1000",
          name: "Rising Star 1000 EXP",
          description: "Reach 1000 total EXP",
          match: (s) => Number(s["total_exp"] ?? 0) >= 1000,
          rewardExp: 0,
          rewardCoin: 50,
        },
      ];

      for (const chk of checks) {

        const achRow = await admin.from("achievements").select("id, reward_exp, reward_coin").eq("code", chk.code).maybeSingle();

        if (!achRow.data) {
          // create achievement template
          const createRes = await admin
            .from("achievements")
            .insert([
              {
                code: chk.code,
                name: chk.name,
                description: chk.description,
                category: "gamification",
                requirement_json: JSON.stringify({ code: chk.code }),
                reward_exp: chk.rewardExp ?? 0,
                reward_coin: chk.rewardCoin ?? 0,
              },
            ])
            .select("id, reward_exp, reward_coin")
            .maybeSingle();
          if (createRes.error) continue;
          achRow.data = createRes.data;
        }

        if (!achRow.data || !achRow.data.id) continue;
        const achId = achRow.data.id;

        const already = await admin
          .from("user_achievements")
          .select("id")
          .eq("user_id", userId)
          .eq("achievement_id", achId)
          .maybeSingle();

        if (!already.data) {
          // fetch latest stats row to evaluate
          const { data: latestStats } = await admin
            .from("user_stats")
            .select("level, total_exp, current_exp, next_level_exp, coins, prayer_streak, full_quest_streak")
            .eq("user_id", userId)
            .maybeSingle();

          if (latestStats && chk.match(latestStats)) {
            // unlock achievement
            const ins = await admin.from("user_achievements").insert([
              {
                user_id: userId,
                achievement_id: achId,
                unlocked_at: new Date().toISOString(),
              },
            ]);

            if (!ins.error) {
              // award rewards
              const awardExp = Number(achRow.data.reward_exp ?? 0);
              const awardCoin = Number(achRow.data.reward_coin ?? 0);
              if (awardExp > 0 || awardCoin > 0) {
                // add to user_stats
                const { data: cur } = await admin
                  .from("user_stats")
                  .select("total_exp, coins")
                  .eq("user_id", userId)
                  .maybeSingle();

                const updatedTotal = (cur?.total_exp ?? 0) + awardExp;
                const preview2 = calculateLevelFromTotalExp(updatedTotal);

                await admin
                  .from("user_stats")
                  .update({
                    total_exp: updatedTotal,
                    current_exp: preview2.currentExp,
                    next_level_exp: preview2.nextLevelExp,
                    level: preview2.level,
                    rank: preview2.rank,
                    coins: (cur?.coins ?? 0) + awardCoin,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("user_id", userId);
              }
            }
          }
        }
      }
    } catch (e) {
      // non-fatal
      console.error("achievement-check failed", e);
    }
  }

  // include awarded values in log
  const logPayload = {
    user_id: userId,
    task_id: taskId,
    log_date: today,
    status,
    completed_at: status === "completed" ? new Date().toISOString() : null,
    exp_awarded: expAward || Number(existingLog?.exp_awarded ?? 0),
    coin_awarded: coinAward || Number(existingLog?.coin_awarded ?? 0),
  };

  const { error: logError } = await admin
    .from("daily_task_logs")
    .upsert(logPayload, { onConflict: "user_id,task_id,log_date" });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: status === "completed" ? "task.complete" : `task.${status}`,
    entityType: "daily_task_log",
    entityId: `${taskId}:${today}`,
    metadata: {
      taskId,
      taskName: existingTask.name,
      category: existingTask.category,
      status,
      logDate: today,
      expAward,
      coinAward,
      rewardGranted: status === "completed" && !alreadyRewarded,
    },
  });

  let leveledUp = false;
  let newLevel = 1;

  if (status === "completed" && !alreadyRewarded) {
    const { data: finalStats } = await admin
      .from("user_stats")
      .select("level")
      .eq("user_id", userId)
      .maybeSingle();

    if (finalStats) {
      newLevel = finalStats.level;
      leveledUp = newLevel > initialLevel;
    }
  }

  // ── Update leaderboard snapshot ──
  try {
    // Count today's completed tasks for this user
    const { data: todayLogs } = await admin
      .from("daily_task_logs")
      .select("status")
      .eq("user_id", userId)
      .eq("log_date", today);

    const completedCount = (todayLogs ?? []).filter((l) => l.status === "completed").length;
    const totalCount = (todayLogs ?? []).length;
    const completionScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    await admin
      .from("leaderboard_snapshots")
      .upsert(
        {
          user_id: userId,
          snapshot_date: today,
          completion_score: completionScore,
          rank_position: null,
        },
        { onConflict: "user_id,snapshot_date" }
      );
  } catch {
    // Non-fatal: leaderboard is optional
  }

  return NextResponse.json({ success: true, status, expAward, coinAward, newLevel, leveledUp });
}
