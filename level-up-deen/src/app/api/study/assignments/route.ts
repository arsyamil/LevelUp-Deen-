import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const assignmentSchema = z.object({
  courseId: z.string().uuid("Course ID tidak valid"),
  title: z.string().min(2, "Judul tugas minimal 2 karakter").max(255),
  description: z.string().optional(),
  deadlineAt: z.string().datetime("Format deadline tidak valid"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  reminderAt: z.string().datetime("Format reminder tidak valid").optional(),
});

const updateSchema = z.object({
  assignmentId: z.string().uuid("Assignment ID tidak valid"),
  isCompleted: z.boolean(),
});

// GET /api/study/assignments — List user's assignments
export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { searchParams } = new URL(request.url);
  const showCompleted = searchParams.get("completed") === "true";

  let query = admin
    .from("study_assignments")
    .select(`
      *,
      course:study_courses (
        id, course_name, course_code, color
      )
    `)
    .eq("user_id", userId)
    .order("deadline_at", { ascending: true });

  if (!showCompleted) {
    query = query.eq("is_completed", false);
  }

  const { data: assignments, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assignments: assignments ?? [] });
}

// POST /api/study/assignments — Create a new assignment
export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = assignmentSchema.safeParse(body);
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

  const { data: assignment, error } = await admin
    .from("study_assignments")
    .insert({
      course_id: result.data.courseId,
      user_id: userId,
      title: result.data.title,
      description: result.data.description ?? null,
      deadline_at: result.data.deadlineAt,
      priority: result.data.priority,
      reminder_at: result.data.reminderAt ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, assignment });
}

// PATCH /api/study/assignments — Mark assignment as complete/incomplete
export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("study_assignments")
    .update({
      is_completed: result.data.isCompleted,
      completed_at: result.data.isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", result.data.assignmentId)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/study/assignments?id=xxx — Delete an assignment
export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("id");
  if (!assignmentId) {
    return NextResponse.json({ error: "Missing assignment ID" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("study_assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
