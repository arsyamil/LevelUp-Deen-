"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SquadManager } from "@/components/squad/squad-manager";
import { SquadMemberList } from "@/components/squad/squad-member-list";
import { useTranslation } from "@/components/providers";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  isMe: boolean;
  trend: string;
}

interface Props {
  userId: string;
  hasSquad: boolean;
  globalLeaderboard: LeaderboardEntry[];
  squadLeaderboard: LeaderboardEntry[];
}

export function SquadPageClient({
  userId,
  hasSquad,
  globalLeaderboard,
  squadLeaderboard,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [leaderboardTab, setLeaderboardTab] = useState<"global" | "squad">(
    hasSquad ? "squad" : "global"
  );

  // Squad data state — fetched client-side when user has a squad
  const [squadData, setSquadData] = useState<{
    id: string;
    name: string;
    isPrivate: boolean;
    myRole: string;
    memberCount: number;
    members: Array<{
      userId: string;
      username: string;
      role: string;
      joinedAt: string;
    }>;
  } | null>(null);
  const [squadLoading, setSquadLoading] = useState(hasSquad);

  // Fetch squad details on mount if user has a squad
  useState(() => {
    if (hasSquad) {
      fetch("/api/squad")
        .then((res) => res.json())
        .then((json) => {
          setSquadData(json.squad ?? null);
        })
        .finally(() => setSquadLoading(false));
    }
  });

  const handleSquadChanged = () => {
    // Refresh the page to get updated server data
    router.refresh();
    // Also re-fetch squad data
    fetch("/api/squad")
      .then((res) => res.json())
      .then((json) => {
        setSquadData(json.squad ?? null);
      });
  };

  const currentLeaderboard =
    leaderboardTab === "squad" && squadLeaderboard.length > 0
      ? squadLeaderboard
      : globalLeaderboard;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Leaderboard */}
      <Card className="p-5">
        {/* Tab switcher */}
        {hasSquad ? (
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setLeaderboardTab("global")}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                leaderboardTab === "global"
                  ? "border-brand bg-brand text-text"
                  : "border-line bg-bg text-text-dim"
              }`}
            >
              🌍 {t("global")}
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab("squad")}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                leaderboardTab === "squad"
                  ? "border-brand bg-brand text-text"
                  : "border-line bg-bg text-text-dim"
              }`}
            >
              👥 {t("mySquad")}
            </button>
          </div>
        ) : null}

        <h2 className="section-title">
          {leaderboardTab === "squad" && hasSquad
            ? t("leaderboardSquad")
            : t("leaderboardGlobal")}
          <span className="ml-2 text-xs font-normal text-text-dim">{t("today")}</span>
        </h2>

        {currentLeaderboard.length === 0 ? (
          <p className="mt-3 text-sm text-text-dim">
            {leaderboardTab === "squad"
              ? t("noSquadDataToday")
              : t("noGlobalDataToday")}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {currentLeaderboard.map((entry) => (
              <li
                key={entry.userId}
                className={`animate-in fade-in slide-in-from-bottom-2 flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
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
                    {entry.rank <= 3
                      ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                      : `#${entry.rank}`}
                  </span>
                  <span className={entry.isMe ? "font-semibold text-brand" : ""}>
                    {entry.username}
                    {entry.isMe && ` ${t("youIndicator")}`}
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

      {/* Squad management */}
      <div className="space-y-4">
        {hasSquad ? (
          squadLoading ? (
            <Card className="p-5">
              <p className="text-sm text-text-dim">{t("loadingSquad")}</p>
            </Card>
          ) : squadData ? (
            <SquadMemberList
              squad={squadData}
              currentUserId={userId}
              onSquadChanged={handleSquadChanged}
            />
          ) : (
            <Card className="p-5">
              <p className="text-sm text-text-dim">{t("squadNotFound")}</p>
            </Card>
          )
        ) : (
          <SquadManager onSquadChanged={handleSquadChanged} />
        )}
      </div>
    </div>
  );
}
