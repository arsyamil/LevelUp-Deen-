import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { completionRate } from "@/lib/gamification";
import { getCurrentUserDashboardData, getCurrentUserDailyTasks } from "@/lib/user";
import { routes } from "@/lib/routes";
import { redirect } from "next/navigation";

const rankColors: Record<string, string> = {
  "E": "muted",
  "D": "default",
  "C": "brand",
  "B": "brand",
  "A": "success",
  "S": "success",
  "S+": "danger",
};

const categoryEmoji: Record<string, string> = {
  deen: "🕌",
  fitness: "💪",
  finance: "💰",
  water: "💧",
  custom: "⭐",
};

const statusStyles = {
  completed: "border-success/20 bg-success/10 text-success",
  pending: "border-line bg-bg-soft text-text-dim",
  skipped: "border-danger/20 bg-danger/10 text-danger",
};

export default async function DashboardPage() {
  const [dashboardData, allTasks] = await Promise.all([
    getCurrentUserDashboardData(),
    getCurrentUserDailyTasks(),
  ]);

  if (!dashboardData) redirect(routes.login);

  const { profile, stats, totalDailyTasks, completedDailyTasks } = dashboardData;
  const name = profile.fullName ?? profile.username ?? "Pengguna";
  const dailyCompletion = completionRate(completedDailyTasks, totalDailyTasks);
  const expProgress = completionRate(stats.currentExp, stats.nextLevelExp);
  const rankBadge = (rankColors[stats.rank] ?? "default") as "muted" | "default" | "brand" | "success" | "danger";

  // Pillar breakdown
  const pillars = [
    { label: "Deen", emoji: "🕌", href: routes.deen },
    { label: "Fitness", emoji: "💪", href: routes.fitness },
    { label: "Keuangan", emoji: "💰", href: routes.finance },
    { label: "Hidrasi", emoji: "💧", href: routes.water },
  ].map((p) => {
    const label = p.label.toLowerCase() === "keuangan" ? "finance" : p.label.toLowerCase() === "hidrasi" ? "water" : p.label.toLowerCase();
    const total = allTasks.filter((t) => t.category === label).length;
    const done = allTasks.filter((t) => t.category === label && t.status === "completed").length;
    return { ...p, total, done, pct: completionRate(done, total) };
  });

  // Recent tasks (first 6)
  const recentTasks = allTasks.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-dim">Assalamu alaikum,</p>
            <h1 className="mt-1 text-2xl font-semibold">{name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={rankBadge}>{stats.rank}-Rank</Badge>
              <span className="text-sm text-text-dim">Level {stats.level}</span>
              <span className="text-sm text-text-dim">·</span>
              <span className="text-sm text-text-dim">{stats.coins} 🪙</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={routes.history} className="rounded-xl border border-line bg-bg px-4 py-2 text-sm text-text-dim transition hover:border-brand hover:text-text">
              Riwayat
            </Link>
            <Link href={routes.achievements} className="rounded-xl border border-line bg-bg px-4 py-2 text-sm text-text-dim transition hover:border-brand hover:text-text">
              Achievements
            </Link>
          </div>
        </div>

        {/* EXP bar */}
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-text-dim">
            <span>EXP menuju Level {stats.level + 1}</span>
            <span>{stats.currentExp} / {stats.nextLevelExp}</span>
          </div>
          <ProgressBar value={expProgress} />
        </div>
      </Card>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Quest Hari Ini", value: `${completedDailyTasks}/${totalDailyTasks}`, sub: `${dailyCompletion}% selesai` },
          { label: "Prayer Streak", value: `${stats.prayerStreak}`, sub: "hari berturut-turut 🔥" },
          { label: "Quest Streak", value: `${stats.fullQuestStreak}`, sub: "hari full quest ⚡" },
          { label: "Total EXP", value: stats.totalExp.toLocaleString("id-ID"), sub: "accumulated" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-text-dim">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-xs text-text-dim">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pillar progress */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Progres Per Pilar</h2>
            <Link href={routes.quests} className="text-xs text-brand hover:underline">
              Lihat Quest →
            </Link>
          </div>
          <div className="space-y-4">
            {pillars.map((p) => (
              <Link key={p.label} href={p.href} className="block group">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium group-hover:text-brand transition-colors">
                    {p.emoji} {p.label}
                  </span>
                  <span className="text-text-dim">{p.done}/{p.total} · {p.pct}%</span>
                </div>
                <ProgressBar value={p.pct} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent tasks */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Quest Terbaru</h2>
            <Link href={routes.quests} className="text-xs text-brand hover:underline">
              Semua Quest →
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-text-dim">
              Belum ada quest. Selesaikan onboarding untuk membuat quest personal otomatis.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-bg-soft px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{categoryEmoji[task.category] ?? "📌"}</span>
                    <span className="truncate font-medium">{task.name}</span>
                  </div>
                  <span className={`shrink-0 rounded border px-2 py-0.5 text-xs uppercase ${statusStyles[task.status]}`}>
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Quick links */}
      <Card className="p-5">
        <h2 className="section-title mb-4">Akses Cepat</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: routes.deen, label: "Deen Tracker", emoji: "🕌", desc: "Shalat & dzikir" },
            { href: routes.water, label: "Water Tracker", emoji: "💧", desc: "Target hidrasi" },
            { href: routes.finance, label: "Finance", emoji: "💰", desc: "Catat transaksi" },
            { href: routes.aiCoach, label: "AI Coach", emoji: "🤖", desc: "Konsultasi & motivasi" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 rounded-xl border border-line bg-bg-soft p-3 transition hover:border-brand/40 hover:bg-brand/5"
            >
              <span className="text-2xl">{link.emoji}</span>
              <div>
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-xs text-text-dim">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
