import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { formatDateInTimeZone } from "@/lib/date";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { SquadPageClient } from "./squad-client";

export default async function SquadPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(routes.login);
  }

  const admin = createSupabaseAdminClient();
  const today = formatDateInTimeZone();

  // ── Fetch global leaderboard ──
  const { data: globalSnapshots } = await admin
    .from("leaderboard_snapshots")
    .select("user_id, completion_score, rank_position, snapshot_date")
    .eq("snapshot_date", today)
    .order("completion_score", { ascending: false })
    .limit(20);

  const yesterday = formatDateInTimeZone(new Date(Date.now() - 86_400_000));
  const { data: yesterdaySnapshots } = await admin
    .from("leaderboard_snapshots")
    .select("user_id, completion_score")
    .eq("snapshot_date", yesterday);

  const yesterdayMap = new Map(
    (yesterdaySnapshots ?? []).map((s) => [s.user_id, s.completion_score])
  );

  // Fetch usernames for leaderboard
  const globalUserIds = (globalSnapshots ?? []).map((s) => s.user_id);
  const { data: globalProfiles } = globalUserIds.length
    ? await admin.from("users_profile").select("id, username").in("id", globalUserIds)
    : { data: [] };

  const usernameMap = new Map(
    (globalProfiles ?? []).map((p) => [p.id, p.username])
  );

  function buildLeaderboard(
    snapshots: typeof globalSnapshots,
    filterUserIds?: string[]
  ) {
    let entries = (snapshots ?? []).map((s) => s);

    if (filterUserIds) {
      const filterSet = new Set(filterUserIds);
      entries = entries.filter((s) => filterSet.has(s.user_id));
    }

    // Re-sort after filtering
    entries.sort((a, b) => b.completion_score - a.completion_score);

    return entries.map((s, idx) => {
      const prevScore = yesterdayMap.get(s.user_id);
      const trend =
        prevScore === undefined
          ? "new"
          : s.completion_score > prevScore
          ? "up"
          : s.completion_score < prevScore
          ? "down"
          : "same";
      return {
        rank: idx + 1,
        userId: s.user_id,
        username: usernameMap.get(s.user_id) ?? "Pengguna",
        score: s.completion_score,
        isMe: s.user_id === userId,
        trend,
      };
    });
  }

  const globalLeaderboard = buildLeaderboard(globalSnapshots);

  // ── Fetch squad membership ──
  const { data: myMembership } = await admin
    .from("squad_members")
    .select("squad_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  let squadMemberIds: string[] = [];
  if (myMembership) {
    const { data: squadMembers } = await admin
      .from("squad_members")
      .select("user_id")
      .eq("squad_id", myMembership.squad_id);
    squadMemberIds = (squadMembers ?? []).map((m) => m.user_id);

    // Also fetch usernames for squad members we might not have
    const missingIds = squadMemberIds.filter((id) => !usernameMap.has(id));
    if (missingIds.length > 0) {
      const { data: extraProfiles } = await admin
        .from("users_profile")
        .select("id, username")
        .in("id", missingIds);
      for (const p of extraProfiles ?? []) {
        usernameMap.set(p.id, p.username);
      }
    }
  }

  const squadLeaderboard = myMembership
    ? buildLeaderboard(globalSnapshots, squadMemberIds)
    : [];

  const myGlobalEntry = globalLeaderboard.find((e) => e.isMe);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Squad &amp; Leaderboard</h1>
        <p className="mt-2 text-sm text-text-dim">
          Fitur sosial opsional. Hanya indikator progres umum yang ditampilkan — data
          keuangan dan ibadah tetap privat.
        </p>
      </Card>

      {/* My position card */}
      {myGlobalEntry ? (
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-text-dim">Posisiku Hari Ini</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand bg-brand/10 text-lg font-bold text-brand">
              #{myGlobalEntry.rank}
            </div>
            <div>
              <p className="font-semibold">{myGlobalEntry.username}</p>
              <p className="text-sm text-text-dim">Score: {myGlobalEntry.score} pts</p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={Math.min(myGlobalEntry.score, 100)} />
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          <p className="text-sm text-text-dim">
            Kamu belum masuk leaderboard hari ini. Selesaikan quest harian untuk muncul di sini!
          </p>
        </Card>
      )}

      {/* Client component handles tabbed leaderboard + squad management */}
      <SquadPageClient
        userId={userId}
        hasSquad={!!myMembership}
        globalLeaderboard={globalLeaderboard}
        squadLeaderboard={squadLeaderboard}
      />
    </div>
  );
}
