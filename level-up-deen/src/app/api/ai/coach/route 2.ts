import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCoachAnswer, CoachIntent } from "@/lib/ai-coach";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    intent?: CoachIntent;
    message?: string;
  };

  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const intent = body.intent;
  const message = body.message?.trim() ?? "";

  if (!intent && !message) {
    return NextResponse.json(
      { error: "Intent atau pesan wajib diisi" },
      { status: 400 }
    );
  }

  const answer = getCoachAnswer(message, intent);
  const prompt = message || `Intent: ${intent}`;

  const { error: logError } = await supabase.from("ai_conversations").insert({
    user_id: session.user.id,
    intent: intent ?? null,
    prompt_summary: prompt,
    response_summary: answer,
  });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  return NextResponse.json({ answer, intent, message });
}
