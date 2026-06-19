"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import type { PlanningBudgetItem, PlanningSavingsGoal } from "@/lib/planning";
import { useTranslation } from "@/components/providers";

const categoryOptions = [
  "Makan dan minum",
  "Transportasi",
  "Ibadah dan sedekah",
  "Pendidikan",
  "Lainnya",
];

interface PlanningManagerProps {
  budgets: PlanningBudgetItem[];
  savingsGoals: PlanningSavingsGoal[];
  month: string;
}

interface BudgetForm {
  category: string;
  budgetAmount: number;
}

interface SavingsGoalForm {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

function getMonthParts(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return { year, month: monthNumber };
}

export function PlanningManager({ budgets, savingsGoals, month }: PlanningManagerProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [budgetForm, setBudgetForm] = useState<BudgetForm>({
    category: categoryOptions[0],
    budgetAmount: 0,
  });
  const [goalForm, setGoalForm] = useState<SavingsGoalForm>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    targetDate: "",
  });

  const refresh = () => {
    startTransition(() => router.refresh());
  };

  const resetBudgetForm = () => {
    setEditingBudgetId(null);
    setBudgetForm({ category: categoryOptions[0], budgetAmount: 0 });
  };

  const resetGoalForm = () => {
    setEditingGoalId(null);
    setGoalForm({ name: "", targetAmount: 0, currentAmount: 0, targetDate: "" });
  };

  const submitBudget = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/planning/budgets", {
      method: editingBudgetId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...budgetForm,
        ...getMonthParts(month),
        id: editingBudgetId ?? undefined,
      }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error || "Gagal menyimpan budget");
      return;
    }

    resetBudgetForm();
    refresh();
  };

  const submitGoal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/planning/savings-goals", {
      method: editingGoalId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...goalForm,
        id: editingGoalId ?? undefined,
      }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error || "Gagal menyimpan savings goal");
      return;
    }

    resetGoalForm();
    refresh();
  };

  const deleteBudget = async (id: string) => {
    setError(null);
    const response = await fetch("/api/planning/budgets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error || "Gagal menghapus budget");
      return;
    }

    if (editingBudgetId === id) resetBudgetForm();
    refresh();
  };

  const archiveGoal = async (id: string) => {
    setError(null);
    const response = await fetch("/api/planning/savings-goals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error || "Gagal mengarsipkan savings goal");
      return;
    }

    if (editingGoalId === id) resetGoalForm();
    refresh();
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {error ? (
        <Card className="border border-danger/20 bg-danger/10 p-4 text-sm text-danger xl:col-span-2">
          {error}
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-title">{editingBudgetId ? t("editBudget") : t("addBudget")}</h2>
          {editingBudgetId ? (
            <button
              type="button"
              onClick={resetBudgetForm}
              className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-text-dim transition hover:border-brand hover:text-text"
            >
              {t("cancel")}
            </button>
          ) : null}
        </div>

        <form onSubmit={submitBudget} className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="font-medium">{t("category")}</span>
            <select
              value={budgetForm.category}
              onChange={(event) =>
                setBudgetForm((current) => ({ ...current, category: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-medium">{t("budgetAmount")}</span>
            <input
              type="number"
              min={1}
              value={budgetForm.budgetAmount || ""}
              onChange={(event) =>
                setBudgetForm((current) => ({
                  ...current,
                  budgetAmount: Number(event.target.value),
                }))
              }
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <button
            type="submit"
            disabled={isPending || budgetForm.budgetAmount <= 0}
            className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-text transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingBudgetId ? t("saveBudget") : t("addBudget")}
          </button>
        </form>

        {budgets.length ? (
          <div className="mt-5 space-y-2">
            {budgets.map((budget) => (
              <div key={budget.id} className="rounded-lg border border-line bg-bg-soft p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{budget.category}</p>
                    <p className="text-xs text-text-dim">{t("activeBudgetMonth")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBudgetId(budget.id);
                        setBudgetForm({
                          category: budget.category,
                          budgetAmount: budget.budget,
                        });
                      }}
                      className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-text-dim transition hover:border-brand hover:text-text"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBudget(budget.id)}
                      className="rounded-lg border border-danger/30 px-3 py-1 text-xs font-medium text-danger transition hover:bg-danger/10"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-title">
            {editingGoalId ? t("editSavingsGoal") : t("addSavingsGoal")}
          </h2>
          {editingGoalId ? (
            <button
              type="button"
              onClick={resetGoalForm}
              className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-text-dim transition hover:border-brand hover:text-text"
            >
              {t("cancel")}
            </button>
          ) : null}
        </div>

        <form onSubmit={submitGoal} className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="font-medium">{t("targetName")}</span>
            <input
              value={goalForm.name}
              onChange={(event) =>
                setGoalForm((current) => ({ ...current, name: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">{t("targetValue")}</span>
              <input
                type="number"
                min={1}
                value={goalForm.targetAmount || ""}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    targetAmount: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium">{t("collectedAmount")}</span>
              <input
                type="number"
                min={0}
                value={goalForm.currentAmount || ""}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    currentAmount: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="font-medium">{t("targetDate")}</span>
            <input
              type="date"
              value={goalForm.targetDate}
              onChange={(event) =>
                setGoalForm((current) => ({ ...current, targetDate: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <button
            type="submit"
            disabled={isPending || !goalForm.name || goalForm.targetAmount <= 0}
            className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-text transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingGoalId ? t("saveGoal") : t("addSavingsGoal")}
          </button>
        </form>

        {savingsGoals.length ? (
          <div className="mt-5 space-y-2">
            {savingsGoals.map((goal) => (
              <div key={goal.id} className="rounded-lg border border-line bg-bg-soft p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-xs text-text-dim">{t("activeGoal")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGoalId(goal.id);
                        setGoalForm({
                          name: goal.name,
                          targetAmount: goal.targetAmount,
                          currentAmount: goal.currentAmount,
                          targetDate: goal.targetDate,
                        });
                      }}
                      className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-text-dim transition hover:border-brand hover:text-text"
                    >
                      {t("edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => archiveGoal(goal.id)}
                      className="rounded-lg border border-danger/30 px-3 py-1 text-xs font-medium text-danger transition hover:bg-danger/10"
                    >
                      {t("archive")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
