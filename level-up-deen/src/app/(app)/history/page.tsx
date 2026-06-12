import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

const categoryEmoji: Record<string, string> = {
  deen: "🕌",
  fitness: "💪",
  finance: "💰",
  water: "💧",
  custom: "⭐",
};

const statusVariant: Record<string, "success" | "danger" | "muted"> = {
  completed: "success",
  skipped: "danger",
  pending: "muted",
};

interface LogRow {
  id: string;
  log_date: string;
  status: string;
  exp_awarded: number;
  coin_awarded: number;
  completed_at: string | null;
  task: { name: string; category: string } | null;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(dateStr));
}

function formatTime(isoStr: string | null) {
  if (!isoStr) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(isoStr));
}

export default async function TaskHistoryPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(routes.login);

  const admin = createSupabaseAdminClient();

  const { data: raw, error } = await admin
    .from("daily_task_logs")
    .select(
      "id, log_date, status, exp_awarded, coin_awarded, completed_at, task:task_id(name, category)"
    )
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .order("completed_at", { ascending: false })
    .limit(150);

  const logs = (raw ?? []) as unknown as LogRow[];

  // Group by date
  const grouped: Record<string, LogRow[]> = {};
  for (const log of logs) {
    const d = log.log_date;
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(log);
  }
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Summary stats
  const totalExp = logs.reduce((s, l) => s + (l.exp_awarded ?? 0), 0);
  const totalCoin = logs.reduce((s, l) => s + (l.coin_awarded ?? 0), 0);
  const completedCount = logs.filter((l) => l.status === "completed").length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Riwayat Tugas</h1>
        <p className="mt-2 text-sm text-text-dim">
          {logs.length} entri terakhir dari semua kategori quest harian.
        </p>
      </Card>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Gagal memuat: {error.message}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Total Selesai</p>
          <p className="mt-2 text-2xl font-semibold text-success">{completedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">EXP Diperoleh</p>
          <p className="mt-2 text-2xl font-semibold text-brand">
            {totalExp.toLocaleString("id-ID")}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Coin Diperoleh</p>
          <p className="mt-2 text-2xl font-semibold">{totalCoin.toLocaleString("id-ID")} 🪙</p>
        </Card>
      </div>

      {dates.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm text-text-dim">
            Belum ada riwayat. Selesaikan quest harian untuk mulai mengisi riwayat.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => {
            const dayLogs = grouped[date];
            const dayCompleted = dayLogs.filter((l) => l.status === "completed").length;
            const dayExp = dayLogs.reduce((s, l) => s + (l.exp_awarded ?? 0), 0);

            return (
              <div key={date}>
                {/* Date header */}
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{formatDate(date)}</p>
                    <p className="mt-0.5 text-xs text-text-dim">
                      {dayCompleted}/{dayLogs.length} selesai · +{dayExp} EXP
                    </p>
                  </div>
                  <Badge variant={dayCompleted === dayLogs.length ? "success" : "muted"}>
                    {dayCompleted === dayLogs.length ? "Full Clear" : `${dayCompleted}/${dayLogs.length}`}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {dayLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg-soft px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg leading-none">
                          {categoryEmoji[log.task?.category ?? ""] ?? "📌"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {log.task?.name ?? "—"}
                          </p>
                          <p className="text-xs text-text-dim">
                            {formatTime(log.completed_at)}
                            {log.exp_awarded > 0 && ` · +${log.exp_awarded} EXP`}
                            {log.coin_awarded > 0 && ` · +${log.coin_awarded} 🪙`}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[log.status] ?? "muted"}>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
