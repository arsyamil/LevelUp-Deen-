import { Card } from "@/components/ui/card";
import { AvatarShop } from "@/components/avatar/avatar-shop";
import { AvatarViewer } from "@/components/avatar/avatar-viewer";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default async function AvatarPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(routes.login);
  }

  const admin = createSupabaseAdminClient();
  const { data: stats } = await admin
    .from("user_stats")
    .select("coins, level, rank")
    .eq("user_id", userId)
    .maybeSingle();

  const coins = stats?.coins ?? 0;
  const level = stats?.level ?? 1;
  const rank = stats?.rank ?? "E";

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Avatar, Shop &amp; Inventory</h1>
        <p className="mt-2 text-sm text-text-dim">
          Kumpulkan coin dari quest harian dan buka item kosmetik berdasarkan level.
        </p>
      </Card>

      {/* Stats bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Coin</p>
          <p className="mt-2 text-2xl font-semibold text-brand">{coins.toLocaleString("id-ID")}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Level</p>
          <p className="mt-2 text-2xl font-semibold">{level}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Rank</p>
          <p className="mt-2 text-2xl font-semibold">{rank}-Rank</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="section-title mb-4">🧑‍🎨 Avatar 3D Preview</h2>
        <div className="h-[280px] sm:h-[400px] w-full overflow-hidden rounded-2xl border-2 border-brand/30 bg-bg-soft">
          <AvatarViewer coachMode />
        </div>
      </Card>

      <AvatarShop />
    </div>
  );
}

