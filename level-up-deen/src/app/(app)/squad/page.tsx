import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { formatDateInTimeZone } from "@/lib/date";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default async function SquadPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(routes.login);
  }

  const admin = createSupabaseAdminClient();
  const today = formatDateInTimeZone();

  // Fetch today's leaderboard snapshots (all users, ordered by score desc)
  const { data: snapshots, error: snapshotError } = await admin
    .from("leaderboard_snapshots")
    .select(
      "user_id, completion_score, rank_position, snapshot_date"
    )
    .eq("snapshot_date", today)
    .order("completion_score", { ascending: false })
    .limit(20);

  // Also get yesterday's for comparison
  const yesterday = formatDateInTimeZone(new Date(Date.now() - 86_400_000));
  const { data: yesterdaySnapshots } = await admin
    .from("leaderboard_snapshots")
    .select("user_id, completion_score")
    .eq("snapshot_date", yesterday);

  const yesterdayMap = new Map(
    (yesterdaySnapshots ?? []).map((s) => [s.user_id, s.completion_score])
  );

  // Fetch profile usernames for the leaderboard users
  const leaderboardUserIds = (snapshots ?? []).map((s) => s.user_id);
  const { data: profiles } = leaderboardUserIds.length
    ? await admin
        .from("users_profile")
        .select("id, username")
        .in("id", leaderboardUserIds)
    : { data: [] };

  const usernameMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));

  // Build entries
  const leaderboard = (snapshots ?? []).map((s, idx) => {
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

  // Find current user's position
  const myEntry = leaderboard.find((e) => e.isMe);

  // Fetch my squad info
  const { data: mySquadMember } = await admin
    .from("squad_members")
    .select("squad_id, role, squad:squad_id(name, is_private)")
    .eq("user_id", userId)
    .maybeSingle();

  const squadInfo = mySquadMember?.squad as { name: string; is_private: boolean } | undefined;

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
      {myEntry ? (
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-text-dim">Posisiku Hari Ini</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand bg-brand/10 text-lg font-bold text-brand">
              #{myEntry.rank}
            </div>
            <div>
              <p className="font-semibold">{myEntry.username}</p>
              <p className="text-sm text-text-dim">Score: {myEntry.score} pts</p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={Math.min(myEntry.score, 100)} />
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          <p className="text-sm text-text-dim">
            Kamu belum masuk leaderboard hari ini. Selesaikan quest harian untuk muncul di sini!
          </p>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leaderboard */}
        <Card className="p-5">
          <h2 className="section-title">
            Leaderboard Hari Ini
            {snapshotError && (
              <span className="ml-2 text-xs font-normal text-danger">
                (gagal memuat)
              </span>
            )}
          </h2>
          {leaderboard.length === 0 ? (
            <p className="mt-3 text-sm text-text-dim">
              Belum ada data hari ini. Leaderboard diperbarui saat pengguna menyelesaikan quest.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {leaderboard.map((entry) => (
                <li
                  key={entry.userId}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    entry.isMe
                      ? "border-brand/40 bg-brand/10"
                      : "border-line bg-bg-soft"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center font-semibold ${
                        entry.rank <= 3 ? "text-brand" : "text-text-dim"
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <span className={entry.isMe ? "font-semibold text-brand" : ""}>
                      {entry.username}
                      {entry.isMe && " (kamu)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.trend === "up" && (
                      <span className="text-xs text-success">↑</span>
                    )}
                    {entry.trend === "down" && (
                      <span className="text-xs text-danger">↓</span>
                    )}
                    {entry.trend === "new" && (
                      <span className="text-xs text-brand">★</span>
                    )}
                    <span className="text-text-dim">{entry.score} pts</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Squad info */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="section-title">Squad-ku</h2>
            {squadInfo ? (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium">{squadInfo.name}</p>
                <p className="text-text-dim">
                  {squadInfo.is_private ? "🔒 Private" : "🌐 Public"} •{" "}
                  Role: {mySquadMember?.role ?? "member"}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-text-dim">
                Kamu belum bergabung di squad manapun. Fitur buat/gabung squad akan tersedia
                di update berikutnya.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="section-title">Aturan Privasi</h2>
            <ul className="mt-3 space-y-2 text-sm text-text-dim">
              <li>✓ Hanya score progres umum yang ditampilkan.</li>
              <li>✓ Data keuangan tidak pernah dibagikan.</li>
              <li>✓ Detail ibadah per waktu tidak ditampilkan.</li>
              <li>✓ Username bisa diganti di Settings.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
