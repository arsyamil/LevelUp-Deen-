import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeSystemAuditLog } from "@/lib/audit";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const savingsGoalSchema = z.object({
  name: z.string().min(1).max(120),
  targetAmount: z.number().positive().max(999_999_999),
  currentAmount: z.number().min(0).max(999_999_999).optional().default(0),
  targetDate: z.string().date().optional().or(z.literal("")),
});

const savingsGoalUpdateSchema = savingsGoalSchema.extend({
  id: z.string().uuid(),
});

const savingsGoalDeleteSchema = z.object({
  id: z.string().uuid(),
});

function normalizeTargetDate(targetDate?: string) {
  return targetDate ? targetDate : null;
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = savingsGoalSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload savings goal tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const payload = result.data;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("savings_goals")
    .insert({
      user_id: userId,
      name: payload.name,
      target_amount: payload.targetAmount,
      current_amount: payload.currentAmount,
      target_date: normalizeTargetDate(payload.targetDate),
      status: "active",
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Gagal menyimpan savings goal" },
      { status: 500 }
    );
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "planning.savings_goal.create",
    entityType: "savings_goal",
    entityId: String(data.id),
    metadata: {
      name: payload.name,
      targetAmount: payload.targetAmount,
      currentAmount: payload.currentAmount,
      targetDate: payload.targetDate,
    },
  });

  return NextResponse.json({ savingsGoal: { id: data.id } });
}

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = savingsGoalUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload savings goal tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const payload = result.data;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("savings_goals")
    .update({
      name: payload.name,
      target_amount: payload.targetAmount,
      current_amount: payload.currentAmount,
      target_date: normalizeTargetDate(payload.targetDate),
      status: "active",
    })
    .eq("id", payload.id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Savings goal tidak ditemukan" }, { status: 404 });
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "planning.savings_goal.update",
    entityType: "savings_goal",
    entityId: String(data.id),
    metadata: {
      name: payload.name,
      targetAmount: payload.targetAmount,
      currentAmount: payload.currentAmount,
      targetDate: payload.targetDate,
    },
  });

  return NextResponse.json({ savingsGoal: { id: data.id } });
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = savingsGoalDeleteSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload savings goal tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("savings_goals")
    .update({ status: "archived" })
    .eq("id", result.data.id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Savings goal tidak ditemukan" }, { status: 404 });
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "planning.savings_goal.archive",
    entityType: "savings_goal",
    entityId: result.data.id,
  });

  return NextResponse.json({ success: true });
}
