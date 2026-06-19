"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import type { TaskCategory, TaskType, TaskLogStatus } from "@/lib/types";
import { Toast } from "@/components/ui/toast";

const sections: TaskType[] = ["mandatory", "recommended", "custom", "bonus"];
const categoryLabels: Record<TaskCategory, string> = {
  deen: "Deen",
  fitness: "Fitness",
  mind: "Mind",
  water: "Water",
  finance: "Finance",
};

const statusStyles: Record<TaskLogStatus, string> = {
  completed: "bg-success/10 text-success border border-success/20",
  pending: "bg-bg-soft text-text-dim border border-line",
  skipped: "bg-danger/10 text-danger border border-danger/20",
};

interface TaskPayload {
  id: string;
  name: string;
  category: TaskCategory;
  taskType: TaskType;
  targetValue?: number;
  targetUnit?: string;
  expReward: number;
  coinReward: number;
  status: TaskLogStatus;
}

interface CreateTaskForm {
  name: string;
  category: TaskCategory;
  taskType: TaskType;
  targetValue?: number;
  targetUnit: string;
  expReward: number;
  coinReward: number;
}

export function QuestList() {
  const [tasks, setTasks] = useState<TaskPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<Record<string, { loading: boolean; text?: string }>>({});
  const [form, setForm] = useState<CreateTaskForm>({
    name: "",
    category: "deen",
    taskType: "custom",
    targetValue: undefined,
    targetUnit: "reps",
    expReward: 10,
    coinReward: 0,
  });

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Gagal memuat tugas");
      }
      setTasks(payload.tasks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat tugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const taskCounts = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "completed").length,
    };
  }, [tasks]);

  const updateTaskStatus = async (taskId: string, status: TaskLogStatus) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Gagal memperbarui status tugas");
      }
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? { ...task, status } : task))
      );

      if (payload.expAward || payload.coinAward) {
        const msgParts = [];
        if (payload.expAward) msgParts.push(`+${payload.expAward} EXP`);
        if (payload.coinAward) msgParts.push(`+${payload.coinAward} coin`);
        setToastMessage(msgParts.join(" • "));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui status tugas");
    } finally {
      setSaving(false);
    }
  };

  const handleGetAiInsight = async (taskName: string, taskId: string) => {
    setAiInsights((prev) => ({ ...prev, [taskId]: { loading: true } }));
    try {
      const response = await fetch("/api/ai/quest-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskName, failCount: 1 }), // Assuming 1 fail count to get initial suggestion
      });
      const data = await response.json();
      if (response.ok && data.recommendation) {
        setAiInsights((prev) => ({ ...prev, [taskId]: { loading: false, text: data.recommendation } }));
      } else {
        throw new Error(data.error || "Gagal mengambil saran AI");
      }
    } catch {
      setAiInsights((prev) => ({ ...prev, [taskId]: { loading: false, text: "Gagal memuat saran AI saat ini." } }));
    }
  };

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Gagal membuat tugas");
      }
      setTasks((current) => [...current, payload.task]);
      setForm({
        name: "",
        category: "deen",
        taskType: "custom",
        targetValue: undefined,
        targetUnit: "reps",
        expReward: 10,
        coinReward: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat tugas");
    } finally {
      setSaving(false);
    }
  };

  const groupedTasks = useMemo(
    () =>
      sections.reduce<Record<TaskType, TaskPayload[]>>((acc, section) => {
        acc[section] = tasks.filter((task) => task.taskType === section);
        return acc;
      }, {
        mandatory: [],
        recommended: [],
        custom: [],
        bonus: [],
      }),
    [tasks]
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Daily Quest System</h1>
            <p className="mt-2 text-sm text-text-dim">
              Tanda tugas selesai untuk melacak progress, atau tambah task custom yang ingin kamu capai hari ini.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-bg-soft p-4 text-sm">
              <p className="font-semibold">Tugas hari ini</p>
              <p>{taskCounts.completed} / {taskCounts.total} selesai</p>
            </div>
            <div className="rounded-2xl border border-line bg-bg-soft p-4 text-sm">
              <p className="font-semibold">Status</p>
              <p>{loading ? "Memuat..." : `${taskCounts.total} tugas aktif`}</p>
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {sections.map((section) => {
            const sectionTasks = groupedTasks[section];
            if (sectionTasks.length === 0) return null;

            return (
              <Card key={section} className="p-5">
                <h2 className="section-title capitalize">{section} Quest</h2>
                <div className="mt-4 space-y-3">
                  {sectionTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-line bg-bg-soft p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{task.name}</p>
                          <p className="mt-2 text-xs text-text-dim">
                            {categoryLabels[task.category]} • +{task.expReward} EXP
                            {task.coinReward > 0 ? ` • +${task.coinReward} coin` : ""}
                          </p>
                          {(task.targetValue || task.targetUnit) && (
                            <p className="mt-2 text-xs text-text-dim">
                              Target: {task.targetValue ?? "-"} {task.targetUnit ?? ""}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${statusStyles[task.status]}`}>
                            {task.status}
                          </span>
                          
                          {task.status !== "completed" && (
                            <button
                              type="button"
                              onClick={() => handleGetAiInsight(task.name, task.id)}
                              disabled={aiInsights[task.id]?.loading}
                              className="rounded-2xl border border-brand/30 bg-brand/5 px-4 py-2 text-xs font-semibold text-brand transition hover:bg-brand/10 disabled:opacity-60"
                            >
                              {aiInsights[task.id]?.loading ? "Memikirkan..." : "✨ Saran AI"}
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                task.status === "completed" ? "pending" : "completed"
                              )
                            }
                            className="rounded-2xl bg-brand px-4 py-2 text-xs font-semibold text-text transition hover:bg-brand/90 disabled:opacity-60"
                          >
                            {task.status === "completed" ? "Tandai Pending" : "Tandai Selesai"}
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => updateTaskStatus(task.id, "skipped")}
                            className="rounded-2xl border border-line bg-bg px-4 py-2 text-xs font-semibold text-text transition hover:border-brand hover:text-brand disabled:opacity-60"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                      
                      {/* AI Insight Dropdown */}
                      {aiInsights[task.id]?.text && (
                        <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 p-3 text-sm">
                          <p className="font-semibold text-brand text-xs mb-1">Coach Deen says:</p>
                          <p className="text-text">{aiInsights[task.id].text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          {tasks.length === 0 && !loading ? (
            <Card className="p-5 text-sm text-text-dim">
              Belum ada tugas aktif untuk akun Anda. Gunakan form di samping untuk membuat task custom.
            </Card>
          ) : null}
        </div>

        <Card className="p-5">
          <h2 className="section-title">Tambah Task Custom</h2>
          <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
            <label className="block text-sm">
              <span className="font-medium">Nama tugas</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Kategori</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as TaskCategory }))}
                  className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium">Tipe tugas</span>
                <select
                  value={form.taskType}
                  onChange={(event) => setForm((current) => ({ ...current, taskType: event.target.value as TaskType }))}
                  className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Target nilai</span>
                <input
                  type="number"
                  value={form.targetValue ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetValue: event.target.value === "" ? undefined : Number(event.target.value),
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Unit target</span>
                <input
                  value={form.targetUnit}
                  onChange={(event) => setForm((current) => ({ ...current, targetUnit: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">EXP reward</span>
                <input
                  type="number"
                  min={0}
                  value={form.expReward}
                  onChange={(event) => setForm((current) => ({ ...current, expReward: Number(event.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Coin reward</span>
                <input
                  type="number"
                  min={0}
                  value={form.coinReward}
                  onChange={(event) => setForm((current) => ({ ...current, coinReward: Number(event.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-text transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Tambah Task"}
            </button>
          </form>
        </Card>
      </div>
      {toastMessage ? <Toast message={toastMessage} /> : null}
    </div>
  );
}

