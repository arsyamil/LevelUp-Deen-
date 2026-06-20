import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { writeSystemAuditLog } from "@/lib/audit";
import { formatDateInTimeZone } from "@/lib/date";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const transactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive().max(999_999_999),
  category: z.string().max(80).optional().default("Lainnya"),
  note: z.string().max(500).optional().default(""),
  transactionDate: z.string().date().optional(),
  accountId: z.string().uuid(),
  toAccountId: z.string().uuid().optional(),
});

const transactionUpdateSchema = transactionSchema.extend({
  id: z.string().uuid(),
});

const transactionDeleteSchema = z.object({
  id: z.string().uuid(),
});

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);

function toTransaction(row: Record<string, unknown>) {
  const category = row.category as Record<string, unknown> | null;

  return {
    id: String(row.id),
    type: row.type,
    category: String(category?.name ?? "Lainnya"),
    amount: Number(row.amount ?? 0),
    note: String(row.note ?? ""),
    transactionDate: String(row.transaction_date),
    accountId: row.account_id ? String(row.account_id) : undefined,
    toAccountId: row.to_account_id ? String(row.to_account_id) : undefined,
  };
}

async function getOrCreateCategory(
  userId: string,
  name: string,
  type: "income" | "expense"
) {
  const admin = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("financial_categories")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .eq("type", type)
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
      type,
      is_default: false,
    })
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Gagal membuat kategori transaksi");
  }

  return String(data.id);
}

function getMonthRange(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function summarizeCategories(transactions: ReturnType<typeof toTransaction>[]) {
  const summary = new Map<string, { category: string; income: number; expense: number }>();

  for (const transaction of transactions) {
    const current = summary.get(transaction.category) ?? {
      category: transaction.category,
      income: 0,
      expense: 0,
    };

    if (transaction.type === "income") {
      current.income += transaction.amount;
    } else if (transaction.type === "expense") {
      current.expense += transaction.amount;
    }

    summary.set(transaction.category, current);
  }

  return Array.from(summary.values()).sort(
    (left, right) => right.income + right.expense - (left.income + left.expense)
  );
}

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthParam = request.nextUrl.searchParams.get("month") ?? formatDateInTimeZone().slice(0, 7);
  const monthResult = monthSchema.safeParse(monthParam);
  if (!monthResult.success) {
    return NextResponse.json({ error: "Filter bulan tidak valid" }, { status: 400 });
  }

  const { startDate, endDate } = getMonthRange(monthResult.data);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("financial_transactions")
    .select("id, type, amount, note, transaction_date, account_id, to_account_id, category:category_id(name)")
    .eq("user_id", userId)
    .gte("transaction_date", startDate)
    .lt("transaction_date", endDate)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transactions = (data ?? []).map((row) => toTransaction(row as Record<string, unknown>));
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else if (transaction.type === "expense") {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return NextResponse.json({
    month: monthResult.data,
    transactions,
    categorySummary: summarizeCategories(transactions),
    totals: {
      ...totals,
      net: totals.income - totals.expense,
    },
  });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = transactionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload transaksi tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

    try {
      const payload = result.data;
      
      const admin = createSupabaseAdminClient();
      
      // Validasi kepemilikan account_id
      const { data: accData } = await admin.from("financial_accounts").select("id").eq("id", payload.accountId).eq("user_id", userId).maybeSingle();
      if (!accData) return NextResponse.json({ error: "Rekening tidak ditemukan atau bukan milik Anda" }, { status: 403 });

      if (payload.type === "transfer" && payload.toAccountId) {
        const { data: toAccData } = await admin.from("financial_accounts").select("id").eq("id", payload.toAccountId).eq("user_id", userId).maybeSingle();
        if (!toAccData) return NextResponse.json({ error: "Rekening tujuan tidak ditemukan atau bukan milik Anda" }, { status: 403 });
      }

      let categoryId = null;
      if (payload.type !== "transfer" && payload.category) {
        categoryId = await getOrCreateCategory(userId, payload.category, payload.type as "income"|"expense");
      }
    const { data, error } = await admin
      .from("financial_transactions")
      .insert({
        user_id: userId,
        category_id: categoryId,
        type: payload.type,
        amount: payload.amount,
        transaction_date: payload.transactionDate ?? formatDateInTimeZone(),
        note: payload.note,
        account_id: payload.accountId,
        to_account_id: payload.type === "transfer" ? payload.toAccountId : null,
      })
      .select("id, type, amount, note, transaction_date, account_id, to_account_id, category:category_id(name)")
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Gagal menyimpan transaksi" },
        { status: 500 }
      );
    }

    const transaction = toTransaction(data as Record<string, unknown>);
    await writeSystemAuditLog({
      actorUserId: userId,
      action: "finance.transaction.create",
      entityType: "financial_transaction",
      entityId: transaction.id,
      metadata: {
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        transactionDate: transaction.transactionDate,
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menyimpan transaksi" },
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
  const result = transactionUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload transaksi tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const payload = result.data;

    const admin = createSupabaseAdminClient();

    // Validasi kepemilikan account_id
    const { data: accData } = await admin.from("financial_accounts").select("id").eq("id", payload.accountId).eq("user_id", userId).maybeSingle();
    if (!accData) return NextResponse.json({ error: "Rekening tidak ditemukan atau bukan milik Anda" }, { status: 403 });

    if (payload.type === "transfer" && payload.toAccountId) {
      const { data: toAccData } = await admin.from("financial_accounts").select("id").eq("id", payload.toAccountId).eq("user_id", userId).maybeSingle();
      if (!toAccData) return NextResponse.json({ error: "Rekening tujuan tidak ditemukan atau bukan milik Anda" }, { status: 403 });
    }

    let categoryId = null;
    if (payload.type !== "transfer" && payload.category) {
      categoryId = await getOrCreateCategory(userId, payload.category, payload.type as "income"|"expense");
    }
    const { data, error } = await admin
      .from("financial_transactions")
      .update({
        category_id: categoryId,
        type: payload.type,
        amount: payload.amount,
        transaction_date: payload.transactionDate ?? formatDateInTimeZone(),
        note: payload.note,
        account_id: payload.accountId,
        to_account_id: payload.type === "transfer" ? payload.toAccountId : null,
      })
      .eq("id", payload.id)
      .eq("user_id", userId)
      .select("id, type, amount, note, transaction_date, account_id, to_account_id, category:category_id(name)")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const transaction = toTransaction(data as Record<string, unknown>);
    await writeSystemAuditLog({
      actorUserId: userId,
      action: "finance.transaction.update",
      entityType: "financial_transaction",
      entityId: transaction.id,
      metadata: {
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        transactionDate: transaction.transactionDate,
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memperbarui transaksi" },
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
  const result = transactionDeleteSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload transaksi tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("financial_transactions")
    .delete()
    .eq("id", result.data.id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "finance.transaction.delete",
    entityType: "financial_transaction",
    entityId: result.data.id,
  });

  return NextResponse.json({ success: true });
}
