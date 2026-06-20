"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface AuditLog {
  id: string;
  created_at: string;
  actor_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  users_profile: {
    username: string;
    email: string;
  } | null;
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/audit?limit=100");
      if (!res.ok) {
        throw new Error("Gagal mengambil log audit");
      }
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-text-dim">Memuat data audit...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-danger">{error}</div>;
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg-soft text-text-dim">
          <tr>
            <th className="px-4 py-3 font-medium">Waktu</th>
            <th className="px-4 py-3 font-medium">Aktor</th>
            <th className="px-4 py-3 font-medium">Aksi</th>
            <th className="px-4 py-3 font-medium">Entitas</th>
            <th className="px-4 py-3 font-medium">Metadata</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {logs.map((log) => (
            <tr key={log.id} className="transition hover:bg-bg-soft/50">
              <td className="px-4 py-3 align-top whitespace-nowrap">
                {new Date(log.created_at).toLocaleString("id-ID")}
              </td>
              <td className="px-4 py-3 align-top">
                {log.users_profile ? (
                  <div>
                    <div className="font-medium">{log.users_profile.username}</div>
                    <div className="text-xs text-text-dim">{log.users_profile.email}</div>
                  </div>
                ) : (
                  <span className="text-text-dim">System</span>
                )}
              </td>
              <td className="px-4 py-3 align-top font-mono text-xs text-brand">
                {log.action}
              </td>
              <td className="px-4 py-3 align-top">
                <span className="inline-block rounded bg-bg-strong px-2 py-1 text-xs">
                  {log.entity_type}
                </span>
                <br />
                <span className="text-xs text-text-dim break-all">{log.entity_id}</span>
              </td>
              <td className="px-4 py-3 align-top">
                <pre className="max-w-xs overflow-x-auto text-xs text-text-dim">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-text-dim">
                Belum ada log aktivitas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
