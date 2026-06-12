import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeSystemAuditLog } from "@/lib/audit";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const budgetSchema = z.object({
  category: z.string().min(1).max(80),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  budgetAmount: z.number().positive().max(999_999_999),
  alertThreshold: z.number().min(0.1).max(1).optional().default(0.8),
});

const budgetUpdateSchema = budgetSchema.extend({
  id: z.string().uuid(),
});

const budgetDeleteSchema = z.object({
  id: z.string().uuid(),
});

async function getOrCreateBudgetCategory(userId: string, name: string) {
  const admin = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("financial_categories")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .eq("type", "expense")
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }
  if (existing?.id) {
    return String(existing.id);
  }

  const { data, error } = await admin
    .from("financial_categories")
    .insert({
      user_id: userId,
      name,
      type: "expense",
      is_default: false,
    })
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Gagal membuat kategori budget");
  }

  return String(data.id);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = budgetSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload budget tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const payload = result.data;
    const categoryId = await getOrCreateBudgetCategory(userId, payload.category);
    const admin = createSupabaseAdminClient();
    const { data: existing, error: existingError } = await admin
      .from("budgets")
      .select("id")
      .eq("user_id", userId)
      .eq("category_id", categoryId)
      .eq("month", payload.month)
      .eq("year", payload.year)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }
    if (existing?.id) {
      return NextResponse.json(
        { error: "Budget kategori ini sudah ada untuk bulan tersebut" },
        { status: 409 }
      );
    }

    const { data, error } = await admin
      .from("budgets")
      .insert({
        user_id: userId,
        category_id: categoryId,
        month: payload.month,
        year: payload.year,
        budget_amount: payload.budgetAmount,
        alert_threshold: payload.alertThreshold,
      })
      .select("id")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Gagal menyimpan budget" },
        { status: 500 }
      );
    }

    await writeSystemAuditLog({
      actorUserId: userId,
      action: "planning.budget.create",
      entityType: "budget",
      entityId: String(data.id),
      metadata: {
        category: payload.category,
        month: payload.month,
        year: payload.year,
        budgetAmount: payload.budgetAmount,
      },
    });

    return NextResponse.json({ budget: { id: data.id } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menyimpan budget" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = budgetUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload budget tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const payload = result.data;
    const categoryId = await getOrCreateBudgetCategory(userId, payload.category);
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("budgets")
      .update({
        category_id: categoryId,
        month: payload.month,
        year: payload.year,
        budget_amount: payload.budgetAmount,
        alert_threshold: payload.alertThreshold,
      })
      .eq("id", payload.id)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Budget tidak ditemukan" }, { status: 404 });
    }

    await writeSystemAuditLog({
      actorUserId: userId,
      action: "planning.budget.update",
      entityType: "budget",
      entityId: String(data.id),
      metadata: {
        category: payload.category,
        month: payload.month,
        year: payload.year,
        budgetAmount: payload.budgetAmount,
      },
    });

    return NextResponse.json({ budget: { id: data.id } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memperbarui budget" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = budgetDeleteSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload budget tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("budgets")
    .delete()
    .eq("id", result.data.id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Budget tidak ditemukan" }, { status: 404 });
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "planning.budget.delete",
    entityType: "budget",
    entityId: result.data.id,
  });

  return NextResponse.json({ success: true });
}
