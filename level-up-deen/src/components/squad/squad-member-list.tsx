"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SquadMember {
  userId: string;
  username: string;
  role: string;
  joinedAt: string;
}

interface SquadInfo {
  id: string;
  name: string;
  isPrivate: boolean;
  myRole: string;
  memberCount: number;
  members: SquadMember[];
}

interface Props {
  squad: SquadInfo;
  currentUserId: string;
  onSquadChanged: () => void;
}

export function SquadMemberList({ squad, currentUserId, onSquadChanged }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [showIdCopied, setShowIdCopied] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function showMsg(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  const handleLeave = async () => {
    if (!confirm("Yakin ingin keluar dari squad ini?")) return;
    setLeaving(true);
    try {
      const res = await fetch("/api/squad", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal keluar dari squad");
      showMsg("Berhasil keluar dari squad.", "success");
      onSquadChanged();
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Gagal keluar", "error");
    } finally {
      setLeaving(false);
    }
  };

  const copySquadId = async () => {
    try {
      await navigator.clipboard.writeText(squad.id);
      setShowIdCopied(true);
      setTimeout(() => setShowIdCopied(false), 2000);
    } catch {
      // Fallback
      showMsg(`ID Squad: ${squad.id}`, "success");
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="section-title">Squad-ku</h2>
            <p className="mt-1 text-lg font-semibold">{squad.name}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={squad.isPrivate ? "brand" : "success"}>
                {squad.isPrivate ? "🔒 Private" : "🌐 Public"}
              </Badge>
              <Badge variant="default">
                {squad.memberCount} anggota
              </Badge>
              <Badge variant={squad.myRole === "admin" ? "brand" : "muted"}>
                {squad.myRole === "admin" ? "Admin" : "Member"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {squad.isPrivate && (
              <Button size="sm" variant="secondary" onClick={copySquadId}>
                {showIdCopied ? "✓ Copied!" : "📋 Copy ID"}
              </Button>
            )}
            <Button
              size="sm"
              variant="danger"
              loading={leaving}
              onClick={handleLeave}
            >
              Keluar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="section-title">Anggota ({squad.members.length})</h2>
        <ul className="mt-3 space-y-2">
          {squad.members.map((member) => {
            const isMe = member.userId === currentUserId;
            return (
              <li
                key={member.userId}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${
                  isMe
                    ? "border-brand/40 bg-brand/10"
                    : "border-line bg-bg-soft"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      member.role === "admin"
                        ? "bg-brand/20 text-brand"
                        : "bg-bg text-text-dim"
                    }`}
                  >
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className={isMe ? "font-semibold text-brand" : ""}>
                      {member.username}
                      {isMe && " (kamu)"}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={member.role === "admin" ? "brand" : "muted"}
                >
                  {member.role === "admin" ? "Admin" : "Member"}
                </Badge>
              </li>
            );
          })}
        </ul>
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
  );
}
