import { NextRequest, NextResponse } from "next/server";
import { getGeminiCoachAnswer } from "@/lib/ai-coach";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  
  const body = (await request.json()) as {
    taskName?: string;
    failCount?: number;
  };

  if (!body.taskName) {
    return NextResponse.json({ error: "taskName wajib diisi" }, { status: 400 });
  }

  const failCount = body.failCount ?? 1;
  let recommendation = "";

  try {
    let userContext;
    if (userId) {
      const admin = createSupabaseAdminClient();
      const { data: stats } = await admin.from("user_stats").select("level, rank, prayer_streak, full_quest_streak").eq("user_id", userId).maybeSingle();
      if (stats) {
        userContext = {
          level: stats.level,
          rank: stats.rank,
          prayerStreak: stats.prayer_streak,
          questStreak: stats.full_quest_streak
        };
      }
    }

    const prompt = `User kesulitan menyelesaikan quest / habit: "${body.taskName}".
Mereka sudah gagal/terlewat ${failCount} kali baru-baru ini.
Berikan 1 kalimat saran (micro-habit atau trik psikologis) yang sangat praktis, empatik, dan actionable untuk membantu mereka menyelesaikan quest ini besok.
Posisikan dirimu sebagai Coach Deen. Jangan gunakan format list, cukup 1 atau 2 kalimat mengalir.`;

    recommendation = await getGeminiCoachAnswer(prompt, [], undefined, userContext);
    
    // Trim jika kepanjangan (kita hanya butuh saran singkat)
    if (recommendation.length > 250) {
      const firstSentence = recommendation.match(/^[^.!?]+[.!?]/);
      recommendation = firstSentence ? firstSentence[0] : recommendation.slice(0, 250) + "...";
    }

  } catch {
    // Fallback if AI fails
    if (failCount >= 3) {
      recommendation = "Pecah tugas ini jadi durasi 2 menit agar otak tidak merasa berat memulai.";
    } else {
      recommendation = "Pindahkan jadwal tugas ini ke waktu di mana kamu punya energi paling tinggi.";
    }
  }

  return NextResponse.json({
    taskName: body.taskName,
    failCount,
    recommendation,
  });
}
