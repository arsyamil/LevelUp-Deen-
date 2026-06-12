const { createClient } = require("@supabase/supabase-js");

async function main() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("Missing SUPABASE env vars. Make sure .env.local is sourced.");
    process.exit(1);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // pick a user
  const { data: firstUser } = await admin.from("users_profile").select("id").limit(1).maybeSingle();
  const userId = firstUser?.id;
  if (!userId) {
    console.error("No users found in users_profile");
    process.exit(1);
  }

  const checks = [
    {
      code: "prayer_streak_3",
      name: "Prayer Streak 3",
      match: (s) => Number(s.prayer_streak ?? 0) >= 3,
      rewardExp: 20,
      rewardCoin: 5,
    },
    {
      code: "prayer_streak_7",
      name: "Prayer Streak 7",
      match: (s) => Number(s.prayer_streak ?? 0) >= 7,
      rewardExp: 60,
      rewardCoin: 20,
    },
    {
      code: "full_quest_streak_3",
      name: "Full Quest Streak 3",
      match: (s) => Number(s.full_quest_streak ?? 0) >= 3,
      rewardExp: 30,
      rewardCoin: 10,
    },
    {
      code: "total_exp_1000",
      name: "Rising Star 1000 EXP",
      match: (s) => Number(s.total_exp ?? 0) >= 1000,
      rewardExp: 0,
      rewardCoin: 50,
    },
  ];

  const unlocked = [];

  for (const chk of checks) {
    const achRow = await admin.from("achievements").select("id, reward_exp, reward_coin").eq("code", chk.code).maybeSingle();
    if (!achRow.data) {
      const createRes = await admin
        .from("achievements")
        .insert([
          {
            code: chk.code,
            name: chk.name,
            description: chk.name,
            category: "gamification",
            requirement_json: JSON.stringify({ code: chk.code }),
            reward_exp: chk.rewardExp ?? 0,
            reward_coin: chk.rewardCoin ?? 0,
          },
        ])
        .select("id, reward_exp, reward_coin")
        .maybeSingle();
      if (createRes.error) {
        console.warn("failed to create achievement", chk.code, createRes.error.message);
        continue;
      }
      achRow.data = createRes.data;
    }
    if (!achRow.data || !achRow.data.id) continue;
    const achId = achRow.data.id;

    const already = await admin.from("user_achievements").select("id").eq("user_id", userId).eq("achievement_id", achId).maybeSingle();
    if (!already.data) {
      const { data: latestStats } = await admin.from("user_stats").select("level, total_exp, coins, prayer_streak, full_quest_streak").eq("user_id", userId).maybeSingle();
      if (latestStats && chk.match(latestStats)) {
        const ins = await admin.from("user_achievements").insert([{ user_id: userId, achievement_id: achId, unlocked_at: new Date().toISOString() }]);
        if (!ins.error) {
          const awardExp = Number(achRow.data.reward_exp ?? 0);
          const awardCoin = Number(achRow.data.reward_coin ?? 0);
          if (awardExp > 0 || awardCoin > 0) {
            const { data: cur } = await admin.from("user_stats").select("total_exp, coins").eq("user_id", userId).maybeSingle();
            const updatedTotal = (cur?.total_exp ?? 0) + awardExp;
            // simple level calc: keep total_exp only for now
            await admin.from("user_stats").update({ total_exp: updatedTotal, coins: (cur?.coins ?? 0) + awardCoin }).eq("user_id", userId);
          }
          unlocked.push({ code: chk.code, achievement_id: achId, awardedExp: achRow.data.reward_exp, awardedCoin: achRow.data.reward_coin });
        }
      }
    }
  }

  console.log({ success: true, userId, unlocked });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
