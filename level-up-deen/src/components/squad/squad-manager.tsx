"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PublicSquad {
  id: string;
  name: string;
  memberCount: number;
}

interface Props {
  onSquadChanged: () => void;
}

export function SquadManager({ onSquadChanged }: Props) {
  const [tab, setTab] = useState<"create" | "join">("join");
  const [squads, setSquads] = useState<PublicSquad[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Create form
  const [squadName, setSquadName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  function showMsg(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  const fetchSquads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/squad");
      const json = await res.json();
      setSquads(json.availableSquads ?? []);
    } catch {
      showMsg("Gagal memuat daftar squad.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSquads();
  }, [fetchSquads]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!squadName.trim() || actionLoading) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/squad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: squadName.trim(), isPrivate }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal membuat squad");
      showMsg(`Squad "${squadName}" berhasil dibuat! 🎉`, "success");
      setSquadName("");
      setIsPrivate(false);
      onSquadChanged();
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Gagal membuat squad", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async (squadId: string) => {
    setJoiningId(squadId);
    try {
      const res = await fetch("/api/squad/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ squadId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal bergabung");
      showMsg(`Berhasil bergabung ke squad "${json.squadName}"! 🎉`, "success");
      onSquadChanged();
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Gagal bergabung", "error");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <Card className="p-5">
      <h2 className="section-title">Bergabung atau Buat Squad</h2>
      <p className="mt-1 text-sm text-text-dim">
        Squad adalah kelompok kecil untuk saling memantau progres dan bersemangat bersama.
      </p>

      {message && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTab("join")}
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            tab === "join"
              ? "border-brand bg-brand text-text"
              : "border-line bg-bg text-text"
          }`}
        >
          Gabung Squad
        </button>
        <button
          type="button"
          onClick={() => setTab("create")}
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            tab === "create"
              ? "border-brand bg-brand text-text"
              : "border-line bg-bg text-text"
          }`}
        >
          Buat Squad Baru
        </button>
      </div>

      {/* Join tab */}
      {tab === "join" && (
        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-sm text-text-dim">Memuat daftar squad publik...</p>
          ) : squads.length === 0 ? (
            <div className="rounded-lg border border-line bg-bg-soft p-4 text-sm text-text-dim">
              Belum ada squad publik. Jadilah yang pertama membuat squad! 🚀
            </div>
          ) : (
            squads.map((squad) => (
              <div
                key={squad.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-bg-soft p-3"
              >
                <div>
                  <p className="font-medium">{squad.name}</p>
                  <p className="text-xs text-text-dim">
                    {squad.memberCount} anggota
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  loading={joiningId === squad.id}
                  disabled={joiningId !== null}
                  onClick={() => handleJoin(squad.id)}
                >
                  Gabung
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create tab */}
      {tab === "create" && (
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="font-medium">Nama Squad</span>
            <input
              type="text"
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
              placeholder="Contoh: Tim Fajr Warriors 🌙"
              maxLength={120}
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isPrivate ? "bg-brand" : "bg-bg-soft border border-line"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  isPrivate ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium">
                {isPrivate ? "🔒 Private" : "🌐 Public"}
              </p>
              <p className="text-xs text-text-dim">
                {isPrivate
                  ? "Hanya bisa join lewat ID Squad"
                  : "Siapa saja bisa melihat dan bergabung"}
              </p>
            </div>
          </div>

          {isPrivate && (
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-3">
              <p className="text-xs text-brand">
                💡 Setelah squad dibuat, share ID Squad kepada teman-teman kamu agar mereka bisa bergabung.
              </p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={actionLoading}
            disabled={!squadName.trim()}
            className="w-full"
          >
            Buat Squad
          </Button>
        </form>
      )}
    </Card>
  );
}
