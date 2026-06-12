import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { calculateLevelFromTotalExp } from "@/lib/gamification";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  const url = new URL(request.url);
  let userId = url.searchParams.get("userId") ?? "";

  const admin = createSupabaseAdminClient();

  if (!userId) {
    const { data: firstUser } = await admin.from("users_profile").select("id").limit(1).maybeSingle();
    userId = firstUser?.id ?? "";
  }

  if (!userId) return NextResponse.json({ error: "userId required or no users exist" }, { status: 400 });

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

  const unlocked: Array<{ code: string; achievement_id?: string; awardedExp?: number; awardedCoin?: number }> = [];

  for (const chk of checks) {
    const achRow = await admin.from("achievements").select("id, reward_exp, reward_coin").eq("code", chk.code).maybeSingle();

    if (!achRow.data) {
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

    const already = await admin.from("user_achievements").select("id").eq("user_id", userId).eq("achievement_id", achId).maybeSingle();

    if (!already.data) {
      const { data: latestStats } = await admin
        .from("user_stats")
        .select("level, total_exp, current_exp, next_level_exp, coins, prayer_streak, full_quest_streak")
        .eq("user_id", userId)
        .maybeSingle();

      if (latestStats && chk.match(latestStats)) {
        const ins = await admin.from("user_achievements").insert([
          {
            user_id: userId,
            achievement_id: achId,
            unlocked_at: new Date().toISOString(),
          },
        ]);

        if (!ins.error) {
          const awardExp = Number(achRow.data.reward_exp ?? 0);
          const awardCoin = Number(achRow.data.reward_coin ?? 0);
          if (awardExp > 0 || awardCoin > 0) {
            const { data: cur } = await admin.from("user_stats").select("total_exp, coins").eq("user_id", userId).maybeSingle();
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

          unlocked.push({ code: chk.code, achievement_id: achId, awardedExp: achRow.data.reward_exp, awardedCoin: achRow.data.reward_coin });
        }
      }
    }
  }

  return NextResponse.json({ success: true, userId, unlocked });
}
