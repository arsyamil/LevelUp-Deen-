"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { routes } from "@/lib/routes";
import type { OnboardingAnswers, PersonalizationPlan } from "@/lib/types";

const defaultAnswers: OnboardingAnswers = {
  userType: "mahasiswa",
  goals: ["ibadah"],
  dailyTimeMinutes: 60,
  pushUpBase: 10,
  squatBase: 20,
  pullUpBase: 0,
  runBaseKm: 2,
  tilawahTarget: "1 halaman",
  waterTargetMl: 1800,
  monthlyIncome: 3000000,
};

const userTypeOptions = [
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "pekerja", label: "Pekerja" },
  { value: "santri", label: "Santri" },
  { value: "freelancer", label: "Freelancer" },
  { value: "lainnya", label: "Lainnya" },
];

const goalOptions = [
  { value: "ibadah", label: "Ibadah" },
  { value: "olahraga", label: "Olahraga" },
  { value: "belajar", label: "Belajar" },
  { value: "finansial", label: "Finansial" },
] as const;

export function OnboardingForm() {
  const [form, setForm] = useState<OnboardingAnswers>(defaultAnswers);
  const [plan, setPlan] = useState<PersonalizationPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const onboardingCompleted = Boolean(plan);

  const handleChange = (key: keyof OnboardingAnswers, value: string | number | string[]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    } as OnboardingAnswers));
  };

  const handleGoalToggle = (goal: OnboardingAnswers["goals"][number]) => {
    setForm((current) => {
      const nextGoals = current.goals.includes(goal)
        ? current.goals.filter((item) => item !== goal)
        : [...current.goals, goal];
      return { ...current, goals: nextGoals };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        const errorText = payload.error ?? "Tidak dapat menyimpan onboarding";
        setMessage(typeof errorText === "string" ? errorText : JSON.stringify(errorText));
        return;
      }

      setPlan(payload.plan ?? null);
      setMessage("Onboarding berhasil disimpan. Rencana personalisasi dibuat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold">Mulai Onboarding</h2>
        <p className="mt-2 text-sm text-text-dim">
          Isi data ini agar sistem bisa membuat target harian dan rekomendasi yang lebih relevan.
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-6 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Tipe pengguna</span>
              <select
                value={form.userType}
                onChange={(event) => handleChange("userType", event.target.value)}
                className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {userTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium">Waktu harian tersedia (menit)</span>
              <input
                type="number"
                value={form.dailyTimeMinutes}
                min={10}
                max={180}
                onChange={(event) => handleChange("dailyTimeMinutes", Number(event.target.value))}
                className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
          </div>

          <div className="space-y-3">
            <p className="font-medium text-sm">Prioritas tujuan</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {goalOptions.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => handleGoalToggle(goal.value)}
                  className={`rounded-2xl border px-4 py-3 text-sm text-left transition ${
                    form.goals.includes(goal.value)
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-line bg-bg text-text hover:border-brand"
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Push-up dasar</span>
              <input
                type="number"
                value={form.pushUpBase}
                min={0}
                max={200}
                onChange={(event) => handleChange("pushUpBase", Number(event.target.value))}
                className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Squat dasar</span>
              <input
                type="number"
                value={form.squatBase}
                min={0}
                max={300}
                onChange={(event) => handleChange("squatBase", Number(event.target.value))}
                className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Pull-up dasar</span>
              <input
                type="number"
                value={form.pullUpBase}
                min={0}
                max={100}
                onChange={(event) => handleChange("pullUpBase", Number(event.target.value))}
                className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Lari dasar (km)</span>
              <input
                type="number"
                step="0.5"
                value={form.runBaseKm}
                min={0}
                max={20}
                onChange={(event) => handleChange("runBaseKm", Number(event.target.value))}
                className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
          </div>

          <div className="space-y-3">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Target tilawah</span>
              <input
                type="text"
                value={form.tilawahTarget}
                onChange={(event) => handleChange("tilawahTarget", event.target.value)}
                className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">Target air (ml)</span>
                <input
                  type="number"
                  value={form.waterTargetMl}
                  min={500}
                  max={5000}
                  onChange={(event) => handleChange("waterTargetMl", Number(event.target.value))}
                  className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Pendapatan bulanan</span>
                <input
                  type="number"
                  value={form.monthlyIncome}
                  min={0}
                  onChange={(event) => handleChange("monthlyIncome", Number(event.target.value))}
                  className="w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-text transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Onboarding"}
          </button>

          {message ? (
            <p className="text-sm text-text-dim" aria-live="polite">
              {message}
            </p>
          ) : null}

          {onboardingCompleted ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-brand/30 bg-brand/10 p-4 sm:flex-row">
              <Link
                href={routes.dashboard}
                data-testid="onboarding-continue-dashboard"
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-text transition hover:bg-brand/90"
              >
                Lanjut ke Dashboard
              </Link>
              <Link
                href={routes.quests}
                className="inline-flex items-center justify-center rounded-2xl border border-brand/40 px-5 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
              >
                Buka Daily Quest
              </Link>
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <h3 className="text-lg font-semibold">Ringkasan Onboarding</h3>
            <p className="text-sm text-text-dim">
              Form ini membantu sistem menentukan kebiasaan harian, target kebugaran, dan rekomendasi yang relevan.
            </p>
            <ul className="space-y-2 text-sm text-text-dim">
              <li>Goal utama membentuk prioritas tenaga harian.</li>
              <li>Profil user akan digunakan untuk rekomendasi AI dan quest.</li>
              <li>Hasil akan tersimpan di profil Supabase user.</li>
            </ul>
          </Card>

          {plan ? (
            <Card className="space-y-4 p-5">
              <div>
                <h3 className="text-lg font-semibold">Rencana Anda</h3>
                <p className="mt-2 text-sm text-text-dim">Rencana ini dihasilkan berdasarkan input onboarding.</p>
              </div>
              <div className="space-y-3 text-sm">
                <p className="font-semibold">Quest harian</p>
                <ul className="list-disc space-y-2 pl-5 text-text-dim">
                  {plan.dailyQuests.map((quest) => (
                    <li key={quest}>{quest}</li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-sm text-text-dim">
                <div className="rounded-2xl border border-line bg-bg-soft p-4">
                  <p className="font-semibold">Fitness target</p>
                  <p>Push-up: {plan.fitnessTargets.pushUp}</p>
                  <p>Squat: {plan.fitnessTargets.squat}</p>
                  <p>Pull-up: {plan.fitnessTargets.pullUp}</p>
                  <p>Lari: {plan.fitnessTargets.runKm} km</p>
                </div>
                <div className="rounded-2xl border border-line bg-bg-soft p-4">
                  <p className="font-semibold">Water & tilawah</p>
                  <p>Minum: {plan.waterTargetMl} ml</p>
                  <p>Tilawah: {plan.tilawahTarget}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-bg p-4 text-sm text-text-dim">
                <p className="font-semibold">Reminder</p>
                <p>{plan.suggestedReminders.join(" • ")}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={routes.dashboard}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-text transition hover:bg-brand/90"
                >
                  Lanjut ke Dashboard
                </Link>
                <Link
                  href={routes.quests}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-text transition hover:border-brand hover:text-brand"
                >
                  Lihat Quest
                </Link>
              </div>
            </Card>
          ) : null}
        </div>
      </form>
    </div>
  );
}
