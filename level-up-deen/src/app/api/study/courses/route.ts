import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const courseSchema = z.object({
  courseName: z.string().min(2, "Nama mata kuliah minimal 2 karakter").max(200),
  courseCode: z.string().max(30).optional(),
  lecturerName: z.string().max(200).optional(),
  semester: z.string().max(20).optional(),
  color: z.string().max(20).optional(),
});

// GET /api/study/courses — List user's courses
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: courses, error } = await admin
    .from("study_courses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ courses: courses ?? [] });
}

// POST /api/study/courses — Create a new course
export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = courseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { data: course, error } = await admin
    .from("study_courses")
    .insert({
      user_id: userId,
      course_name: result.data.courseName,
      course_code: result.data.courseCode ?? null,
      lecturer_name: result.data.lecturerName ?? null,
      semester: result.data.semester ?? null,
      color: result.data.color ?? "#6366f1",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Award STUDIOUS achievement
  try {
    await admin.rpc("award_achievement", { p_user_id: userId, p_code: "STUDIOUS" });
  } catch (e) {
    console.error("Failed to award STUDIOUS achievement:", e);
  }

  return NextResponse.json({ success: true, course });
}

// DELETE /api/study/courses — Soft-delete a course (set is_active = false)
export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("id");
  if (!courseId) {
    return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("study_courses")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", courseId)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
