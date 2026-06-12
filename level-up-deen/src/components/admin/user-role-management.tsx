"use client";

import { useEffect, useState } from "react";
import { roleDefinitions } from "@/lib/rbac";

interface UserRow {
  id: string;
  username: string;
  fullName: string;
  userType: string;
  onboardingCompleted: boolean;
  email: string;
  role: string;
  createdAt: string;
}

interface AuditLogRow {
  id: string;
  changed_by: string | null;
  changed_by_email: string | null;
  changed_user_id: string;
  previous_role: string;
  new_role: string;
  note: string | null;
  created_at: string;
}

export function UserRoleManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/users");
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Gagal mengambil data pengguna");
        }
        setUsers(payload.users);
        setAuditLogs(payload.auditLogs ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const updateRole = async (userId: string, role: string) => {
    setSavingId(userId);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Gagal mengubah role");
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? {
                ...user,
                role,
              }
            : user
        )
      );
      setSuccess("Role berhasil diperbarui.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-line bg-bg-soft p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Admin User Role Management</h3>
          <p className="text-sm text-text-dim">
            Atur role pengguna dan lihat semua akun terdaftar. User biasa tidak dapat
            mengubah role atau melihat role lain.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-text-dim">Memuat data pengguna...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-sm">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Nama
                </th>
                <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Username
                </th>
                <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Email
                </th>
                <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Role
                </th>
                <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-3 text-text">{user.fullName}</td>
                  <td className="px-3 py-3 text-text-dim">@{user.username}</td>
                  <td className="px-3 py-3 text-text-dim">{user.email}</td>
                  <td className="px-3 py-3 text-text">
                    <select
                      value={user.role}
                      onChange={(event) => updateRole(user.id, event.target.value)}
                      className="w-full rounded-2xl border border-line bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                      disabled={savingId === user.id}
                    >
                      {roleDefinitions.map((role) => (
                        <option key={role.key} value={role.key}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-text">
                    <button
                      type="button"
                      disabled={savingId === user.id}
                      onClick={() => updateRole(user.id, user.role)}
                      className="rounded-2xl border border-line bg-bg px-4 py-2 text-xs font-semibold text-text transition hover:border-brand hover:bg-bg-soft disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingId === user.id ? "Menyimpan..." : "Simpan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {auditLogs.length > 0 ? (
            <div className="mt-8 rounded-2xl border border-line bg-bg p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold">Riwayat Perubahan Role</h4>
                  <p className="text-sm text-text-dim">
                    Menampilkan 10 perubahan role terbaru yang dilakukan oleh admin.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                        Tanggal
                      </th>
                      <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                        Admin
                      </th>
                      <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                        User
                      </th>
                      <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                        Dari
                      </th>
                      <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                        Ke
                      </th>
                      <th className="px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-3 py-3 text-text-dim">
                          {new Date(log.created_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-3 py-3 text-text-dim">
                          {log.changed_by_email ?? log.changed_by ?? "Unknown"}
                        </td>
                        <td className="px-3 py-3 text-text-dim">{log.changed_user_id}</td>
                        <td className="px-3 py-3 text-text">{log.previous_role}</td>
                        <td className="px-3 py-3 text-text">{log.new_role}</td>
                        <td className="px-3 py-3 text-text-dim">{log.note ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}

      {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}
    </div>
  );
}
