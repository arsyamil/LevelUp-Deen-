import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default async function AchievementsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect(routes.login);

  const admin = createSupabaseAdminClient();

  // Ambil semua pencapaian
  const { data: allAchievements } = await admin
    .from("achievements")
    .select("*")
    .order("created_at", { ascending: true });

  // Ambil pencapaian pengguna saat ini
  const { data: userAchievements } = await admin
    .from("user_achievements")
    .select("achievement_id, earned_at")
    .eq("user_id", userId);

  const earnedIds = new Set(userAchievements?.map(a => a.achievement_id) || []);

  const totalExp = allAchievements?.reduce((sum, ach) => earnedIds.has(ach.id) ? sum + ach.reward_exp : sum, 0) || 0;
  const totalCoins = allAchievements?.reduce((sum, ach) => earnedIds.has(ach.id) ? sum + ach.reward_coin : sum, 0) || 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Pencapaian (Achievements)</h1>
        <p className="mt-2 text-sm text-text-dim">
          Kumpulkan badge, Exp, dan Koin dengan menyelesaikan berbagai tantangan di dalam aplikasi.
        </p>
        
        <div className="mt-4 flex gap-4">
          <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
            <p className="text-xs text-brand">Total Exp Diraih</p>
            <p className="text-xl font-bold text-brand">+{totalExp} XP</p>
          </div>
          <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-3">
            <p className="text-xs text-success">Total Koin Diraih</p>
            <p className="text-xl font-bold text-success">+{totalCoins} 🪙</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allAchievements?.map(ach => {
          const isEarned = earnedIds.has(ach.id);
          const earnedData = userAchievements?.find(ua => ua.achievement_id === ach.id);
          
          return (
            <Card key={ach.id} className={`relative overflow-hidden p-5 transition-all ${isEarned ? "border-brand/30 shadow-sm" : "opacity-75 grayscale"}`}>
              {isEarned && (
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/10" />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-inner ${isEarned ? "bg-gradient-to-br from-brand/20 to-brand/5" : "bg-bg-soft"}`}>
                  {ach.icon_url ? <img src={ach.icon_url} alt="icon" className="w-10 h-10 object-contain" /> : "🏆"}
                </div>
                <h3 className="font-semibold">{ach.name}</h3>
                <p className="mt-1 text-xs text-text-dim">{ach.description}</p>
                
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge variant="brand" className="border-brand/30">+{ach.reward_exp} XP</Badge>
                  <Badge variant="success" className="border-success/30">+{ach.reward_coin} Koin</Badge>
                </div>
                
                {isEarned && earnedData && (
                  <p className="mt-4 text-[10px] uppercase tracking-wider text-brand font-medium">
                    Diraih pada {new Date(earnedData.earned_at).toLocaleDateString('id-ID')}
                  </p>
                )}
                {!isEarned && (
                  <p className="mt-4 text-[10px] uppercase tracking-wider text-text-dim">
                    Belum diraih
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
