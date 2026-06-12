import { getCurrentUserId } from "@/lib/auth";
import { formatDateInTimeZone } from "@/lib/date";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { BudgetItem, SavingsGoal } from "@/lib/types";

interface BudgetRow {
  id: string;
  budget_amount: number | string;
  category: { name: string } | { name: string }[] | null;
}

interface TransactionRow {
  type: "income" | "expense";
  amount: number | string;
  category: { name: string } | { name: string }[] | null;
}

interface SavingsGoalRow {
  id: string;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  target_date: string | null;
}

export interface PlanningBudgetItem extends BudgetItem {
  id: string;
}

export interface PlanningSavingsGoal extends SavingsGoal {
  id: string;
}

export interface PlanningData {
  month: string;
  budgets: PlanningBudgetItem[];
  savingsGoals: PlanningSavingsGoal[];
  monthlyNetSaving: number;
}

export function getCurrentPlanningMonthParts() {
  const today = formatDateInTimeZone();
  const [year, month] = today.slice(0, 7).split("-").map(Number);

  return {
    year,
    month,
    monthKey: today.slice(0, 7),
    startDate: `${today.slice(0, 7)}-01`,
    endDate: new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10),
  };
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function getCategoryName(category: BudgetRow["category"]) {
  if (Array.isArray(category)) {
    return category[0]?.name ?? "Lainnya";
  }

  return category?.name ?? "Lainnya";
}

export async function getCurrentUserPlanningData(): Promise<PlanningData | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { year, month, monthKey, startDate, endDate } = getCurrentPlanningMonthParts();

  const [budgetsResult, transactionsResult, savingsGoalsResult] = await Promise.all([
    admin
      .from("budgets")
      .select("id, budget_amount, category:category_id(name)")
      .eq("user_id", userId)
      .eq("year", year)
      .eq("month", month)
      .order("created_at", { ascending: true }),
    admin
      .from("financial_transactions")
      .select("type, amount, category:category_id(name)")
      .eq("user_id", userId)
      .gte("transaction_date", startDate)
      .lt("transaction_date", endDate),
    admin
      .from("savings_goals")
      .select("id, name, target_amount, current_amount, target_date")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: true }),
  ]);

  if (budgetsResult.error || transactionsResult.error || savingsGoalsResult.error) {
    return null;
  }

  const spentByCategory = new Map<string, number>();
  let monthlyNetSaving = 0;

  for (const transaction of (transactionsResult.data ?? []) as unknown as TransactionRow[]) {
    const amount = toNumber(transaction.amount);
    const category = getCategoryName(transaction.category);

    if (transaction.type === "income") {
      monthlyNetSaving += amount;
    } else {
      monthlyNetSaving -= amount;
      spentByCategory.set(category, (spentByCategory.get(category) ?? 0) + amount);
    }
  }

  const budgets = ((budgetsResult.data ?? []) as unknown as BudgetRow[]).map((budget) => {
    const category = getCategoryName(budget.category);

    return {
      id: budget.id,
      category,
      budget: toNumber(budget.budget_amount),
      spent: spentByCategory.get(category) ?? 0,
    };
  });

  const savingsGoals = ((savingsGoalsResult.data ?? []) as unknown as SavingsGoalRow[]).map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: toNumber(goal.target_amount),
    currentAmount: toNumber(goal.current_amount),
    targetDate: goal.target_date ?? "",
  }));

  return {
    month: monthKey,
    budgets,
    savingsGoals,
    monthlyNetSaving,
  };
}
