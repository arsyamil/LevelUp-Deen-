import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { Parser } from "expr-eval";

// GET /api/finance/ratios — Calculate financial ratios for current month
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  // 1. Get all active ratio templates
  const { data: templates } = await admin
    .from("financial_ratio_templates")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (!templates || templates.length === 0) {
    return NextResponse.json({ ratios: [], message: "Belum ada template rasio" });
  }

  // 2. Aggregate user's financial data for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: transactions } = await admin
    .from("financial_transactions")
    .select("type, amount")
    .eq("user_id", userId)
    .gte("transaction_date", startOfMonth)
    .lte("transaction_date", endOfMonth);

  // Calculate aggregates
  let income = 0;
  let expense = 0;

  for (const tx of transactions ?? []) {
    const amount = Number(tx.amount) || 0;
    if (tx.type === "income") {
      income += amount;
    } else if (tx.type === "expense") {
      expense += amount;
    }
  }

  const savings = income - expense;
  const debt = 0; // Placeholder — can be extended with a debt tracking table
  const monthly_expense = expense;
  const needs = expense * 0.5; // Placeholder estimate

  const variables: Record<string, number> = {
    income,
    expense,
    savings,
    debt,
    monthly_expense,
    needs,
  };

  // 3. Evaluate each formula
  const parser = new Parser();
  const ratios = templates.map((tmpl) => {
    let value: number | null = null;
    let status: "healthy" | "warning" | "critical" = "healthy";

    try {
      const expr = parser.parse(tmpl.formula);
      const requiredVars = (tmpl.variables as string[]) ?? [];
      const allDefined = requiredVars.every((v) => variables[v] !== undefined && variables[v] !== 0);

      if (allDefined) {
        value = expr.evaluate(variables);
        // Determine status
        if (value !== null) {
          if (value >= tmpl.healthy_min && value <= tmpl.healthy_max) {
            status = "healthy";
          } else if (
            value >= tmpl.healthy_min * 0.7 &&
            value <= tmpl.healthy_max * 1.3
          ) {
            status = "warning";
          } else {
            status = "critical";
          }
        }
      }
    } catch {
      // Formula evaluation failed — skip
      value = null;
    }

    return {
      id: tmpl.id,
      name: tmpl.name,
      description: tmpl.description,
      formula: tmpl.formula,
      value: value !== null ? Math.round(value * 100) / 100 : null,
      unit: tmpl.unit,
      healthyMin: tmpl.healthy_min,
      healthyMax: tmpl.healthy_max,
      status,
    };
  });

  return NextResponse.json({
    ratios,
    summary: { income, expense, savings },
    period: { start: startOfMonth, end: endOfMonth },
  });
}
