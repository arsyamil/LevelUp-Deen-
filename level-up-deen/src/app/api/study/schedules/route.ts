import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const scheduleSchema = z.object({
  courseId: z.string().uuid("Course ID tidak valid"),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam harus HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam harus HH:MM"),
  sessionType: z.enum(["teori", "praktikum", "responsi", "ujian"]).default("teori"),
  room: z.string().max(80).optional(),
  building: z.string().max(120).optional(),
  reminderMinutes: z.number().int().min(0).max(120).default(30),
});

// GET /api/study/schedules — List user's schedules
export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { searchParams } = new URL(request.url);
  const day = searchParams.get("day");

  let query = admin
    .from("study_schedules")
    .select(`
      *,
      course:study_courses (
        id, course_name, course_code, lecturer_name, color
      )
    `)
    .eq("user_id", userId)
    .order("start_time", { ascending: true });

  if (day !== null) {
    query = query.eq("day_of_week", Number(day));
  }

  const { data: schedules, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schedules: schedules ?? [] });
}

// POST /api/study/schedules — Create a new schedule
export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = scheduleSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  // Verify user owns the course
  const admin = createSupabaseAdminClient();
  const { data: course } = await admin
    .from("study_courses")
    .select("id")
    .eq("id", result.data.courseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!course) {
    return NextResponse.json({ error: "Mata kuliah tidak ditemukan" }, { status: 404 });
  }

  const { data: schedule, error } = await admin
    .from("study_schedules")
    .insert({
      course_id: result.data.courseId,
      user_id: userId,
      day_of_week: result.data.dayOfWeek,
      start_time: result.data.startTime,
      end_time: result.data.endTime,
      session_type: result.data.sessionType,
      room: result.data.room ?? null,
      building: result.data.building ?? null,
      reminder_minutes: result.data.reminderMinutes,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, schedule });
}

// DELETE /api/study/schedules?id=xxx — Delete a schedule
export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scheduleId = searchParams.get("id");
  if (!scheduleId) {
    return NextResponse.json({ error: "Missing schedule ID" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("study_schedules")
    .delete()
    .eq("id", scheduleId)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
