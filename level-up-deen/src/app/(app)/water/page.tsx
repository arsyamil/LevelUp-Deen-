"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useTranslation } from "@/components/providers";

const QUICK_AMOUNTS = [150, 250, 330, 500, 750];
const DEFAULT_TARGET_ML = 2000;

interface WaterLog {
  id: string;
  amount_ml: number;
  created_at: string;
}

function formatTime(isoString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(isoString));
}

export default function WaterPage() {
  const { t } = useTranslation();
  const [totalMl, setTotalMl] = useState(0);
  const [targetMl, setTargetMl] = useState(DEFAULT_TARGET_ML);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customMl, setCustomMl] = useState("");

  const progress = Math.min(Math.round((totalMl / targetMl) * 100), 100);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/water");
      if (!res.ok) throw new Error(t("errLoadData"));
      const json = await res.json();
      setTotalMl(json.totalMl ?? 0);
      setTargetMl(json.targetMl ?? DEFAULT_TARGET_ML);
      setLogs(json.logs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errOccurred"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function addWater(ml: number) {
    if (adding !== null) return;
    setAdding(ml);
    setError(null);
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl: ml }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? t("errAddLog"));
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errOccurred"));
    } finally {
      setAdding(null);
    }
  }

  async function handleCustomAdd() {
    const ml = parseInt(customMl, 10);
    if (isNaN(ml) || ml <= 0) return;
    setCustomMl("");
    await addWater(ml);
  }

  const remaining = Math.max(targetMl - totalMl, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("waterTrackerTitle")}</h1>
        <p className="mt-2 text-sm text-text-dim">
          {t("waterTrackerDesc")}
        </p>
      </Card>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Main progress card */}
      <Card className="p-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-dim">{t("today")}</p>
            <p className="mt-1 text-3xl font-semibold">
              {totalMl.toLocaleString("id-ID")}{" "}
              <span className="text-lg font-normal text-text-dim">
                / {targetMl.toLocaleString("id-ID")} ml
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-dim">{t("remaining")}</p>
            <p className="text-xl font-semibold text-brand">
              {remaining.toLocaleString("id-ID")} ml
            </p>
          </div>
        </div>

        <ProgressBar value={progress} />

        <p className="mt-2 text-sm text-text-dim">{progress}% {t("reached")}</p>

        {progress >= 100 && (
          <p className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
            {t("targetReached")}
          </p>
        )}
      </Card>

      {/* Quick add buttons */}
      <Card className="p-5">
        <h2 className="section-title">{t("quickAdd")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((ml) => (
            <button
              key={ml}
              type="button"
              disabled={adding !== null}
              onClick={() => addWater(ml)}
              className="rounded-lg border border-line bg-bg-soft px-4 py-2 text-sm font-medium text-text-dim transition hover:border-brand hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding === ml ? "..." : `+${ml} ml`}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="number"
            value={customMl}
            onChange={(e) => setCustomMl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomAdd()}
            placeholder={t("customAmountPlaceholder")}
            min={1}
            max={5000}
            disabled={adding !== null}
            className="flex-1 rounded-lg border border-line bg-bg-soft px-3 py-2 text-sm text-text placeholder-text-dim outline-none focus:border-brand disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleCustomAdd}
            disabled={adding !== null || !customMl}
            className="rounded-lg border border-line bg-bg-soft px-4 py-2 text-sm font-medium text-text-dim transition hover:border-brand hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("addBtn")}
          </button>
        </div>
      </Card>

      {/* Log history */}
      <Card className="p-5">
        <h2 className="section-title">{t("historyToday")}</h2>
        {loading ? (
          <p className="mt-3 text-sm text-text-dim">{t("loading")}</p>
        ) : logs.length === 0 ? (
          <p className="mt-3 text-sm text-text-dim">
            {t("noLogsToday")}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...logs].reverse().map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between rounded-lg border border-line bg-bg-soft px-3 py-2 text-sm"
              >
                <span className="text-text-dim">{formatTime(log.created_at)}</span>
                <span className="font-medium text-brand">+{log.amount_ml} ml</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
