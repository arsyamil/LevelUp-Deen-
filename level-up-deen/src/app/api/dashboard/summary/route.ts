import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { formatDateInTimeZone } from "@/lib/date";
import { getGeminiCoachAnswer } from "@/lib/ai-coach";

function getGreeting(): { greeting: string; emoji: string; timeOfDay: string } {
  const hour = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    hour12: false,
  });
  const h = parseInt(hour, 10);

  if (h >= 3 && h < 10) return { greeting: "Selamat pagi", emoji: "🌅", timeOfDay: "pagi" };
  if (h >= 10 && h < 15) return { greeting: "Selamat siang", emoji: "☀️", timeOfDay: "siang" };
  if (h >= 15 && h < 18) return { greeting: "Selamat sore", emoji: "🌇", timeOfDay: "sore" };
  return { greeting: "Selamat malam", emoji: "🌙", timeOfDay: "malam" };
}

function getStreakMessage(prayerStreak: number, questStreak: number): string | null {
  if (prayerStreak >= 30) return `🔥 Masyaa Allah! Streak shalat ${prayerStreak} hari — konsistensi luar biasa!`;
  if (prayerStreak >= 14) return `⚡ Streak shalat ${prayerStreak} hari! Terus pertahankan ya!`;
  if (prayerStreak >= 7) return `🎯 Satu minggu penuh shalat tepat waktu! Semangat!`;
  if (prayerStreak >= 3) return `✨ Streak shalat ${prayerStreak} hari — jangan sampai putus hari ini!`;
  if (questStreak >= 7) return `🏆 Quest streak ${questStreak} hari! Kamu konsisten banget.`;
  if (questStreak >= 3) return `💪 Quest streak ${questStreak} hari — lanjutkan!`;
  return null;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const today = formatDateInTimeZone();
  const yesterday = formatDateInTimeZone(new Date(Date.now() - 86_400_000));

  // Fetch user data in parallel
  const [profileResult, statsResult, todayLogsResult, yesterdayLogsResult] = await Promise.all([
    admin
      .from("users_profile")
      .select("username, full_name")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("user_stats")
      .select("level, rank, prayer_streak, full_quest_streak, coins, current_exp, next_level_exp")
      .eq("user_id", userId)
      .maybeSingle(),
    admin
      .from("daily_task_logs")
      .select("status")
      .eq("user_id", userId)
      .eq("log_date", today),
    admin
      .from("daily_task_logs")
      .select("status")
      .eq("user_id", userId)
      .eq("log_date", yesterday),
  ]);

  const username = profileResult.data?.full_name ?? profileResult.data?.username ?? "Pengguna";
  const stats = statsResult.data;
  const prayerStreak = stats?.prayer_streak ?? 0;
  const questStreak = stats?.full_quest_streak ?? 0;

  // Calculate yesterday's completion
  const yesterdayLogs = yesterdayLogsResult.data ?? [];
  const yesterdayTotal = yesterdayLogs.length;
  const yesterdayCompleted = yesterdayLogs.filter((l) => l.status === "completed").length;
  const yesterdayRate = yesterdayTotal > 0 ? Math.round((yesterdayCompleted / yesterdayTotal) * 100) : -1;

  // Today's progress
  const todayLogs = todayLogsResult.data ?? [];
  const todayTotal = todayLogs.length;
  const todayCompleted = todayLogs.filter((l) => l.status === "completed").length;

  // Build greeting
  const { greeting, emoji, timeOfDay } = getGreeting();
  const streakMessage = getStreakMessage(prayerStreak, questStreak);

  // Recovery prompt if yesterday was below 50%
  let recoveryPrompt: string | null = null;
  if (yesterdayRate >= 0 && yesterdayRate < 50) {
    recoveryPrompt = `Kemarin kamu menyelesaikan ${yesterdayCompleted}/${yesterdayTotal} quest. Hari ini kesempatan baru — mulai dari yang ringan dulu! 💚`;
  }

  // Generate AI insight (1 short sentence)
  let aiInsight: string | null = null;
  try {
    const contextPrompt = `Berikan SATU kalimat motivasi singkat (maks 20 kata) untuk user yang:
- Level ${stats?.level ?? 1}, rank ${stats?.rank ?? "E"}
- Prayer streak: ${prayerStreak} hari
- Quest streak: ${questStreak} hari
- Progress hari ini: ${todayCompleted}/${todayTotal} quest
- Waktu sekarang: ${timeOfDay}
Jangan sebut data angka mentah, cukup kalimat natural yang memotivasi.`;

    aiInsight = await getGeminiCoachAnswer(contextPrompt, [], undefined, {
      username: profileResult.data?.username ?? undefined,
      level: stats?.level ?? 1,
      rank: stats?.rank ?? "E",
      prayerStreak,
      questStreak,
      coins: stats?.coins ?? 0,
    });

    // Trim to first sentence if too long
    if (aiInsight && aiInsight.length > 200) {
      const firstSentence = aiInsight.match(/^[^.!?]+[.!?]/);
      aiInsight = firstSentence ? firstSentence[0] : aiInsight.slice(0, 200) + "...";
    }
  } catch {
    // Non-fatal: AI insight is optional
    aiInsight = null;
  }

  return NextResponse.json({
    greeting: `${emoji} ${greeting}, ${username}!`,
    streakMessage,
    recoveryPrompt,
    aiInsight,
    todayProgress: {
      completed: todayCompleted,
      total: todayTotal,
    },
    stats: {
      prayerStreak,
      questStreak,
      level: stats?.level ?? 1,
      currentExp: stats?.current_exp ?? 0,
      nextLevelExp: stats?.next_level_exp ?? 150,
    },
  });
}
