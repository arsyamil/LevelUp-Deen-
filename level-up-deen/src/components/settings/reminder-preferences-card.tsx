"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/card";

interface ReminderPrefs {
  subuhReminderEnabled: boolean;
  waterReminderIntervalMin: number;
  dailyReflectionTime: string;
}

interface ReminderPreferencesCardProps {
  initialPrefs: ReminderPrefs;
}

export function ReminderPreferencesCard({ initialPrefs }: ReminderPreferencesCardProps) {
  const [prefs, setPrefs] = useState<ReminderPrefs>(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderPrefs: prefs }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan.");
      setMessage("Preferensi reminder disimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="section-title">Reminder Preferences</h2>

      {message && (
        <p className="mt-3 rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Subuh reminder toggle */}
        <div className="flex items-center justify-between rounded-lg border border-line bg-bg-soft px-4 py-3">
          <div>
            <p className="text-sm font-medium">Subuh Reminder</p>
            <p className="text-xs text-text-dim">Notifikasi sebelum waktu Subuh</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.subuhReminderEnabled}
            onClick={() =>
              setPrefs((p) => ({ ...p, subuhReminderEnabled: !p.subuhReminderEnabled }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              prefs.subuhReminderEnabled ? "bg-brand" : "bg-bg"
            } border border-line`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                prefs.subuhReminderEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Water reminder interval */}
        <div>
          <label className="block text-sm font-medium">
            Interval Water Reminder
          </label>
          <p className="text-xs text-text-dim">Pengingat minum setiap berapa menit</p>
          <select
            value={prefs.waterReminderIntervalMin}
            onChange={(e) =>
              setPrefs((p) => ({ ...p, waterReminderIntervalMin: Number(e.target.value) }))
            }
            className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {[30, 60, 90, 120, 180].map((min) => (
              <option key={min} value={min}>
                Setiap {min} menit
              </option>
            ))}
          </select>
        </div>

        {/* Daily reflection time */}
        <div>
          <label className="block text-sm font-medium">
            Waktu Daily Reflection Reminder
          </label>
          <p className="text-xs text-text-dim">Pengingat refleksi harian</p>
          <input
            type="time"
            value={prefs.dailyReflectionTime}
            onChange={(e) =>
              setPrefs((p) => ({ ...p, dailyReflectionTime: e.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Preferensi"}
        </button>
      </form>
    </Card>
  );
}
