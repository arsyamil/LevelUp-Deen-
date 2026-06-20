"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import type { FinancialTransaction } from "@/lib/types";
import { useTranslation } from "@/components/providers";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { SavingsGoalsCard } from "./savings-goals-card";
import { BudgetCard } from "./budget-card";

const categoryOptions = [
  "Makan dan minum",
  "Transportasi",
  "Ibadah dan sedekah",
  "Pendidikan",
  "Kesehatan",
  "Belanja",
  "Income utama",
  "Freelance",
  "Lainnya",
];

interface FinancePayload {
  month: string;
  transactions: FinancialTransaction[];
  categorySummary: Array<{
    category: string;
    income: number;
    expense: number;
  }>;
  totals: {
    income: number;
    expense: number;
    net: number;
  };
}

interface TransactionForm {
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string;
  transactionDate: string;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function todayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function currentMonth() {
  return todayDate().slice(0, 7);
}

function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(Date.UTC(year, monthIndex - 1, 1)));
}

export function FinanceTracker() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [categorySummary, setCategorySummary] = useState<FinancePayload["categorySummary"]>([]);
  const [totals, setTotals] = useState<FinancePayload["totals"]>({
    income: 0,
    expense: 0,
    net: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nlInput, setNlInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [form, setForm] = useState<TransactionForm>({
    type: "expense",
    amount: 0,
    category: "Makan dan minum",
    note: "",
    transactionDate: todayDate(),
  });

  const parseWithAI = async () => {
    if (!nlInput.trim() || parsing) return;
    setParsing(true);
    try {
      const res = await fetch("/api/ai/finance-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: nlInput.trim() }),
      });
      const result = await res.json();
      if (res.ok && result.amount !== undefined) {
        setForm((f) => ({
          ...f,
          type: result.type ?? f.type,
          category: result.category ?? f.category,
          amount: result.amount ?? f.amount,
          note: result.note ?? f.note,
        }));
        setNlInput("");
      }
    } catch {
      // Silently ignore parse errors
    } finally {
      setParsing(false);
    }
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/finance/transactions?month=${selectedMonth}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as Partial<FinancePayload> & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || t("errLoadFinance"));
      }

      setTransactions(payload.transactions ?? []);
      setCategorySummary(payload.categorySummary ?? []);
      setTotals(payload.totals ?? { income: 0, expense: 0, net: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errLoadFinance"));
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, t]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const expenseCategorySummary = useMemo(() => {
    return categorySummary.filter((item) => item.expense > 0);
  }, [categorySummary]);

  const incomeCategorySummary = useMemo(() => {
    return categorySummary.filter((item) => item.income > 0);
  }, [categorySummary]);

  const monthLabel = useMemo(() => {
    return formatMonthLabel(selectedMonth);
  }, [selectedMonth]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      type: "expense",
      amount: 0,
      category: "Makan dan minum",
      note: "",
      transactionDate: todayDate(),
    });
  };

  const handleEdit = (transaction: FinancialTransaction) => {
    setEditingId(transaction.id);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note ?? "",
      transactionDate: transaction.transactionDate,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/finance/transactions", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      });
      const payload = (await response.json()) as {
        transaction?: FinancialTransaction;
        error?: string;
      };

      if (!response.ok || !payload.transaction) {
        throw new Error(payload.error || t("errSaveFinance"));
      }

      await loadTransactions();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errSaveFinance"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (transactionId: string) => {
    setDeletingId(transactionId);
    setError(null);

    try {
      const response = await fetch("/api/finance/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: transactionId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || t("errDeleteFinance"));
      }

      if (editingId === transactionId) {
        resetForm();
      }
      await loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errDeleteFinance"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">{t("income")}</p>
          <p className="mt-2 text-xl font-semibold">{formatRupiah(totals.income)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">{t("expense")}</p>
          <p className="mt-2 text-xl font-semibold">{formatRupiah(totals.expense)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">{t("net")}</p>
          <p className="mt-2 text-xl font-semibold">{formatRupiah(totals.net)}</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-title">{t("monthlySummary")}</h2>
            <p className="mt-1 text-sm text-text-dim">
              {monthLabel} · {transactions.length} {t("transactionsForMonth")}
            </p>
          </div>
          <label className="block text-sm md:w-56">
            <span className="font-medium">{t("month")}</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value || currentMonth())}
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-line bg-bg-soft p-4">
            <p className="text-sm font-semibold">{t("expenseByCategory")}</p>
            <div className="mt-4 h-48 w-full">
              {expenseCategorySummary.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategorySummary}
                      dataKey="expense"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {expenseCategorySummary.map((entry, index) => {
                        const colors = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <RechartsTooltip formatter={(value: any) => formatRupiah(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-text-dim flex h-full items-center justify-center">{t("noExpenseMonth")}</p>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {expenseCategorySummary.map((item, index) => {
                const colors = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16"];
                return (
                  <div key={`legend-${index}`} className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                      <span>{item.category}</span>
                    </div>
                    <span className="font-medium">{formatRupiah(item.expense)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-bg-soft p-4">
            <p className="text-sm font-semibold">{t("incomeByCategory")}</p>
            <div className="mt-4 h-48 w-full">
              {incomeCategorySummary.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeCategorySummary}
                      dataKey="income"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {incomeCategorySummary.map((entry, index) => {
                        const colors = ["#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <RechartsTooltip formatter={(value: any) => formatRupiah(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-text-dim flex h-full items-center justify-center">{t("noIncomeMonth")}</p>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {incomeCategorySummary.map((item, index) => {
                const colors = ["#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6"];
                return (
                  <div key={`legend-${index}`} className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                      <span>{item.category}</span>
                    </div>
                    <span className="font-medium">{formatRupiah(item.income)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <BudgetCard categorySummary={categorySummary} selectedMonth={selectedMonth} />
        <SavingsGoalsCard />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="p-5">
          <h2 className="section-title">{t("transactionsForMonth")} {monthLabel}</h2>
          <div className="mt-3 space-y-2 text-sm">
            {loading ? (
              <p className="text-text-dim">{t("loadingTransactions")}</p>
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="rounded-lg border border-line bg-bg-soft p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{tx.category}</p>
                      <p className="text-xs text-text-dim">
                        {tx.transactionDate} · {tx.note || "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={tx.type === "income" ? "text-success" : "text-text"}>
                        {tx.type === "income" ? "+" : "-"}
                        {formatRupiah(tx.amount)}
                      </p>
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(tx)}
                          className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-text-dim transition hover:border-brand hover:text-text"
                        >
                          {t("edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          className="rounded-lg border border-danger/30 px-3 py-1 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === tx.id ? t("deleting") : t("delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-line bg-bg-soft p-4 text-text-dim">
                {t("noTransactionsMonth")}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">
              {editingId ? t("editTransaction") : t("addTransaction")}
            </h2>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-text-dim transition hover:border-brand hover:text-text"
              >
                {t("cancel")}
              </button>
            ) : null}
          </div>

          {/* AI natural language quick-input */}
          {!editingId && (
            <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 p-3">
              <p className="text-xs font-medium text-brand mb-2">{t("quickInputAI")}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nlInput}
                  onChange={(e) => setNlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && parseWithAI()}
                  placeholder={t("placeholderAI")}
                  disabled={parsing}
                  className="flex-1 rounded-xl border border-line bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={parseWithAI}
                  disabled={parsing || !nlInput.trim()}
                  className="shrink-0 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-text transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {parsing ? "..." : t("parse")}
                </button>
              </div>
              <p className="mt-1 text-xs text-text-dim">{t("parseAIInfo")}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(["expense", "income"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, type }))}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    form.type === type
                      ? "border-brand bg-brand text-text"
                      : "border-line bg-bg text-text"
                  }`}
                >
                  {type === "expense" ? t("expense") : t("income")}
                </button>
              ))}
            </div>

            <label className="block text-sm">
              <span className="font-medium">{t("amount")}</span>
              <input
                type="number"
                min={1}
                value={form.amount || ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: Number(event.target.value) }))
                }
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium">{t("category")}</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
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
              <span className="font-medium">{t("date")}</span>
              <input
                type="date"
                value={form.transactionDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, transactionDate: event.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium">{t("note")}</span>
              <textarea
                value={form.note}
                onChange={(event) =>
                  setForm((current) => ({ ...current, note: event.target.value }))
                }
                className="mt-2 min-h-24 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <button
              type="submit"
              disabled={saving || form.amount <= 0}
              className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-text transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? t("saving")
                : editingId
                  ? t("saveChanges")
                  : t("saveTransaction")}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
