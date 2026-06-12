import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoachChat } from "@/components/ai-coach/coach-chat";
import { getCurrentUserDashboardData } from "@/lib/user";

export default async function AICoachPage() {
  const dashboardData = await getCurrentUserDashboardData();
  const stats = dashboardData?.stats;
  const profile = dashboardData?.profile;
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">AI Deen &amp; Life Coach</h1>
            <p className="mt-2 text-sm text-text-dim">
              Pendamping motivasi dan produktivitas — bukan fatwa, tidak menilai kualitas ibadah.
            </p>
          </div>
          <Badge variant={hasApiKey ? "success" : "muted"}>
            {hasApiKey ? "Gemini 1.5 Flash" : "Mode Offline"}
          </Badge>
        </div>

        {/* User context strip */}
        {stats && (
          <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-line bg-bg-soft p-3 text-sm">
            <span className="text-text-dim">
              👤 {profile?.username ?? "Pengguna"}
            </span>
            <span className="text-text-dim">Lv.{stats.level} · {stats.rank}-Rank</span>
            <span className="text-text-dim">🔥 Prayer streak: {stats.prayerStreak} hari</span>
            <span className="text-text-dim">⚡ Quest streak: {stats.fullQuestStreak} hari</span>
            <span className="text-text-dim">🪙 {stats.coins} coin</span>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 p-3 text-xs text-brand">
          💡 Konteks profilmu dikirim ke AI Coach agar saran lebih personal dan relevan.
        </div>
      </Card>

      <CoachChat />
    </div>
  );
}
