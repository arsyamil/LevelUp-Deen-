import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";

async function getOrCreateCategory(userId: string, name: string) {
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("financial_categories")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .eq("type", "expense")
    .maybeSingle();

  if (existing?.id) return String(existing.id);

  const { data } = await admin
    .from("financial_categories")
    .insert({ user_id: userId, name, type: "expense", is_default: false })
    .select("id")
    .maybeSingle();

  if (!data?.id) throw new Error("Gagal membuat kategori");
  return String(data.id);
}

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("budgets")
      .select("id, month, year, budget_amount, alert_threshold, category:category_id(name)")
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year);

    if (error) throw error;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = data.map((d: any) => ({
      id: d.id,
      month: d.month,
      year: d.year,
      amount: Number(d.budget_amount),
      alertThreshold: Number(d.alert_threshold),
      category: d.category?.name || "Lainnya",
    }));

    return NextResponse.json({ budgets: formatted });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { category, amount, month, year, alertThreshold } = await request.json();

    if (!category || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const categoryId = await getOrCreateCategory(userId, category);
    const supabase = await createSupabaseServerClient();

    // Check if budget already exists
    const { data: existing } = await supabase
      .from("budgets")
      .select("id")
      .eq("user_id", userId)
      .eq("category_id", categoryId)
      .eq("month", month || new Date().getMonth())
      .eq("year", year || new Date().getFullYear())
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from("budgets")
        .update({ budget_amount: amount, alert_threshold: alertThreshold || 0.8 })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ budget: data });
    }

    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: userId,
        category_id: categoryId,
        month: month || new Date().getMonth(),
        year: year || new Date().getFullYear(),
        budget_amount: amount,
        alert_threshold: alertThreshold || 0.8,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ budget: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Error" }, { status: 500 });
  }
}
