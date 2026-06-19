import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { getGeminiCoachAnswer, CoachIntent, CoachMessage } from "@/lib/ai-coach";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    intent?: CoachIntent;
    message?: string;
    history?: CoachMessage[];
  };

  const intent = body.intent;
  const message = body.message?.trim() ?? "";
  const history = body.history ?? [];

  if (!intent && !message) {
    return NextResponse.json(
      { error: "Intent atau pesan wajib diisi" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  // Fetch user context to enrich the Gemini prompt
  const [profileResult, statsResult, tasksResult] = await Promise.all([
    admin
      .from("users_profile")
      .select("username, user_type")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("user_stats")
      .select("level, rank, coins, prayer_streak, full_quest_streak")
      .eq("user_id", userId)
      .maybeSingle(),
    admin
      .from("user_tasks")
      .select("name, is_completed")
      .eq("user_id", userId)
      .eq("is_active", true)
  ]);

  const userContext = {
    username: profileResult.data?.username ?? undefined,
    userType: profileResult.data?.user_type ?? undefined,
    level: statsResult.data?.level ?? 1,
    rank: statsResult.data?.rank ?? "E",
    prayerStreak: statsResult.data?.prayer_streak ?? 0,
    questStreak: statsResult.data?.full_quest_streak ?? 0,
    coins: statsResult.data?.coins ?? 0,
    activeTasks: tasksResult.data ?? [],
  };

  const prompt = message || "Halo Coach, beri aku saran!";
  const answer = await getGeminiCoachAnswer(prompt, history, intent, userContext);

  // Log to ai_conversations table
  const { error: logError } = await admin.from("ai_conversations").insert({
    user_id: userId,
    intent: intent ?? null,
    prompt_summary: prompt.slice(0, 500),
    response_summary: answer.slice(0, 500),
  });

  if (logError) {
    // Non-fatal — don't fail the request just because logging failed
    console.error("[ai/coach] Failed to log conversation:", logError.message);
  }

  return NextResponse.json({ answer, intent, message });
}
