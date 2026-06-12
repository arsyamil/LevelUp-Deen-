import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

const rarityEmoji: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
  legendary: "👑",
};

const rarityBadge: Record<string, "muted" | "default" | "brand" | "success" | "danger"> = {
  bronze: "muted",
  silver: "default",
  gold: "brand",
  platinum: "success",
  legendary: "danger",
};

interface AchRow {
  id: string;
  unlocked_at: string;
  achievement: {
    code: string;
    name: string;
    description: string;
    reward_exp: number;
    reward_coin: number;
    rarity?: string;
  } | null;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export default async function AchievementsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(routes.login);

  const admin = createSupabaseAdminClient();

  // Fetch unlocked achievements
  const { data: raw, error } = await admin
    .from("user_achievements")
    .select(
      "id, unlocked_at, achievement:achievement_id(code, name, description, reward_exp, reward_coin)"
    )
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  // Fetch total available achievements for progress
  const { count: totalAvailable } = await admin
    .from("achievements")
    .select("id", { count: "exact", head: true });

  const achievements = (raw ?? []) as unknown as AchRow[];
  const unlockedCount = achievements.length;
  const pct =
    totalAvailable && totalAvailable > 0
      ? Math.round((unlockedCount / totalAvailable) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Achievements</h1>
        <p className="mt-2 text-sm text-text-dim">
          Pencapaian khusus yang terbuka berdasarkan aktivitas dan konsistensimu.
        </p>
      </Card>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Gagal memuat: {error.message}
        </div>
      )}

      {/* Progress overview */}
      <Card className="p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-dim">Progress Koleksi</p>
            <p className="mt-1 text-2xl font-semibold">
              {unlockedCount}
              {totalAvailable != null && (
                <span className="text-base font-normal text-text-dim">
                  {" "}/ {totalAvailable} achievement
                </span>
              )}
            </p>
          </div>
          <p className="text-2xl font-semibold text-brand">{pct}%</p>
        </div>
        <div className="mt-3">
          <ProgressBar value={pct} />
        </div>
      </Card>

      {achievements.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm text-text-dim">
            Belum ada achievement yang terbuka. Selesaikan quest harian secara konsisten
            untuk membuka pencapaian pertamamu! 🎯
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((row) => {
            const a = row.achievement;
            const rarity = a?.rarity ?? "bronze";
            return (
              <Card key={row.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-2xl">
                    {rarityEmoji[rarity] ?? "🏆"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold">{a?.name ?? "Unknown"}</p>
                      <Badge variant={rarityBadge[rarity] ?? "muted"}>
                        {rarity}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-text-dim">{a?.description ?? ""}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-dim">
                      {(a?.reward_exp ?? 0) > 0 && (
                        <span className="text-brand">+{a?.reward_exp} EXP</span>
                      )}
                      {(a?.reward_coin ?? 0) > 0 && (
                        <span>+{a?.reward_coin} 🪙</span>
                      )}
                      <span>Dibuka: {formatDate(row.unlocked_at)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
