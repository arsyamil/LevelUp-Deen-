import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { formatDateInTimeZone } from "@/lib/date";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const today = formatDateInTimeZone();

  const { data, error } = await admin
    .from("water_logs")
    .select("id, amount_ml, created_at")
    .eq("user_id", userId)
    .eq("log_date", today)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: waterTasks } = await admin
    .from("user_tasks")
    .select("target_value")
    .eq("user_id", userId)
    .eq("category", "water")
    .limit(1)
    .maybeSingle();

  const totalMl = (data ?? []).reduce((sum, row) => sum + (row.amount_ml ?? 0), 0);
  const targetMl = waterTasks?.target_value ? Number(waterTasks.target_value) : 2000;

  return NextResponse.json({ logs: data ?? [], totalMl, targetMl, date: today });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const amountMl = Number(body.amountMl ?? 0);

  if (!amountMl || amountMl <= 0 || amountMl > 5000) {
    return NextResponse.json(
      { error: "amountMl harus antara 1 dan 5000" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const today = formatDateInTimeZone();

  const { data, error } = await admin
    .from("water_logs")
    .insert({ user_id: userId, log_date: today, amount_ml: amountMl })
    .select("id, amount_ml, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: data, success: true });
}
