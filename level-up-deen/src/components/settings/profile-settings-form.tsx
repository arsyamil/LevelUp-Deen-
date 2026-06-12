"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import type { UserProfile } from "@/lib/types";

const userTypeOptions: Array<{ label: string; value: UserProfile["userType"] }> = [
  { label: "Mahasiswa", value: "mahasiswa" },
  { label: "Pekerja", value: "pekerja" },
  { label: "Santri", value: "santri" },
  { label: "Freelancer", value: "freelancer" },
  { label: "Lainnya", value: "lainnya" },
];

const timezoneOptions = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"];

interface ProfileSettingsFormProps {
  profile: UserProfile;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: profile.username,
    fullName: profile.fullName,
    timezone: profile.timezone,
    userType: profile.userType,
  });

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Gagal menyimpan profil");
      }

      setMessage("Profil berhasil disimpan.");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5">
      <h2 className="section-title">Profil</h2>
      {error ? (
        <p className="mt-3 rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success">
          {message}
        </p>
      ) : null}

      <form onSubmit={submitProfile} className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Username</span>
          <input
            value={form.username}
            onChange={(event) =>
              setForm((current) => ({ ...current, username: event.target.value }))
            }
            className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Nama</span>
          <input
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Timezone</span>
          <select
            value={form.timezone}
            onChange={(event) =>
              setForm((current) => ({ ...current, timezone: event.target.value }))
            }
            className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {timezoneOptions.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium">User type</span>
          <select
            value={form.userType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                userType: event.target.value as UserProfile["userType"],
              }))
            }
            className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {userTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving || isPending || form.username.length < 3 || !form.fullName}
            className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-black transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {saving || isPending ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </form>
    </Card>
  );
}
