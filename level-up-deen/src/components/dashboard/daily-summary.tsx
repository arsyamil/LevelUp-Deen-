"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface SummaryData {
  greeting: string;
  streakMessage: string | null;
  recoveryPrompt: string | null;
  aiInsight: string | null;
  todayProgress: { completed: number; total: number };
  stats: {
    prayerStreak: number;
    questStreak: number;
    level: number;
    currentExp: number;
    nextLevelExp: number;
  };
}

export function DailySummary() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/summary");
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <Card className="p-5">
        <div className="space-y-3">
          <div className="h-5 w-3/4 animate-pulse rounded-lg bg-bg-soft" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-bg-soft" />
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const hasContent = data.streakMessage || data.recoveryPrompt || data.aiInsight;

  return (
    <Card className="relative overflow-hidden p-5">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-success/5 pointer-events-none" />

      <div className="relative space-y-3">
        {/* Greeting */}
        <p className="text-lg font-semibold">{data.greeting}</p>

        {/* Quick stats pills */}
        <div className="flex flex-wrap gap-2">
          {data.stats.prayerStreak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              🔥 Shalat {data.stats.prayerStreak} hari
            </span>
          )}
          {data.stats.questStreak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-medium text-success">
              ⚡ Quest {data.stats.questStreak} hari
            </span>
          )}
          {data.todayProgress.total > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-soft px-3 py-1 text-xs font-medium text-text-dim">
              📋 {data.todayProgress.completed}/{data.todayProgress.total} hari ini
            </span>
          )}
        </div>

        {/* Messages */}
        {hasContent && (
          <div className="space-y-2 pt-1">
            {data.streakMessage && (
              <p className="text-sm text-text-dim">{data.streakMessage}</p>
            )}

            {data.recoveryPrompt && (
              <div className="rounded-lg border border-brand/20 bg-brand/5 px-3 py-2">
                <p className="text-sm text-brand">{data.recoveryPrompt}</p>
              </div>
            )}

            {data.aiInsight && (
              <div className="rounded-lg border border-line bg-bg-soft px-3 py-2">
                <p className="text-xs font-medium text-text-dim mb-1">✨ Coach Deen</p>
                <p className="text-sm text-text">{data.aiInsight}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
