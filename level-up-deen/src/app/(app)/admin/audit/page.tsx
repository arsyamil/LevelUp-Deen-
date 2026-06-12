import Link from "next/link";
import { Card } from "@/components/ui/card";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/user";
import { routes } from "@/lib/routes";
import { isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";

interface AdminAuditPageProps {
  searchParams?: {
    q?: string;
  };
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect(routes.login);
  }

  const role = profile.role;
  if (!isAdminRole(role)) {
    return (
      <main className="container-shell py-12">
        <Card className="max-w-2xl p-8">
          <h1 className="text-2xl font-semibold">Akses Audit Ditolak</h1>
          <p className="mt-4 text-sm text-text-dim">
            Hanya admin sistem yang dapat melihat riwayat audit perubahan role.
          </p>
        </Card>
      </main>
    );
  }

  const admin = createSupabaseAdminClient();
  const roleQuery = admin
    .from("admin_role_change_logs")
    .select(
      "id, changed_by, changed_by_email, changed_user_id, previous_role, new_role, note, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const search = searchParams?.q?.trim();
  const filteredRoleQuery = search
    ? roleQuery.or(`changed_by_email.ilike.%${search}%,note.ilike.%${search}%`)
    : roleQuery;

  const systemQuery = admin
    .from("system_audit_logs")
    .select("id, actor_user_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const filteredSystemQuery = search
    ? systemQuery.or(`actor_user_id.ilike.%${search}%,action.ilike.%${search}%,entity_type.ilike.%${search}%,entity_id.ilike.%${search}%`)
    : systemQuery;

  const deletionQuery = admin
    .from("account_deletion_requests")
    .select("id, user_id, status, reason, requested_at, processed_at, processed_by")
    .order("requested_at", { ascending: false })
    .limit(50);

  const filteredDeletionQuery = search
    ? deletionQuery.or(`user_id.ilike.%${search}%,status.ilike.%${search}%,reason.ilike.%${search}%`)
    : deletionQuery;

  const [
    { data: auditLogs, error: auditError },
    { data: systemAuditLogs, error: systemAuditError },
    { data: deletionRequests, error: deletionRequestError },
  ] = await Promise.all([filteredRoleQuery, filteredSystemQuery, filteredDeletionQuery]);

  if (auditError || systemAuditError || deletionRequestError) {
    return (
      <main className="container-shell py-12">
        <Card className="max-w-2xl p-8">
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="mt-4 text-sm text-red-500">
            {auditError?.message ?? systemAuditError?.message ?? deletionRequestError?.message}
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="container-shell py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Audit Log Admin</h1>
          <p className="mt-2 text-sm text-text-dim">
            Melihat audit role dan mutasi sistem terbaru. Gunakan pencarian untuk
            memfilter berdasarkan email admin, action, entity, atau ID pengguna.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-line bg-bg px-4 py-2 text-sm text-text transition hover:border-brand hover:bg-bg-soft"
        >
          Kembali ke Admin Console
        </Link>
      </div>

      <Card className="p-6">
        <form className="mb-6" action="/admin/audit" method="get">
          <label htmlFor="q" className="sr-only">
            Cari audit
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="q"
              name="q"
              defaultValue={search ?? ""}
              placeholder="Cari email, action, entity, atau user ID"
              className="min-w-0 flex-1 rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="submit"
              className="rounded-2xl border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              Cari
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead>
              <tr>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Waktu
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Admin
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  User ID
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Dari Role
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Ke Role
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Catatan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(auditLogs ?? []).map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-3 text-text-dim">{formatDateTime(log.created_at)}</td>
                  <td className="px-3 py-3 text-text">{log.changed_by_email ?? log.changed_by ?? "Unknown"}</td>
                  <td className="px-3 py-3 text-text-dim">{log.changed_user_id}</td>
                  <td className="px-3 py-3 text-text">{log.previous_role}</td>
                  <td className="px-3 py-3 text-text">{log.new_role}</td>
                  <td className="px-3 py-3 text-text-dim">{log.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="section-title">Request Delete Account</h2>
        <p className="mt-2 text-sm text-text-dim">
          Daftar request penghapusan akun yang perlu ditinjau sebelum diproses manual.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead>
              <tr>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Requested
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  User ID
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Status
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Alasan
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Processed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(deletionRequests ?? []).map((request) => (
                <tr key={request.id}>
                  <td className="px-3 py-3 text-text-dim">
                    {formatDateTime(request.requested_at)}
                  </td>
                  <td className="px-3 py-3 text-text-dim">{request.user_id}</td>
                  <td className="px-3 py-3 text-text">{request.status}</td>
                  <td className="max-w-md px-3 py-3 text-text-dim">
                    {request.reason || "-"}
                  </td>
                  <td className="px-3 py-3 text-text-dim">
                    {request.processed_at
                      ? `${formatDateTime(request.processed_at)} by ${request.processed_by ?? "Unknown"}`
                      : "-"}
                  </td>
                </tr>
              ))}
              {deletionRequests?.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-text-dim" colSpan={5}>
                    Belum ada request delete account.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="section-title">Audit Mutasi Sistem</h2>
        <p className="mt-2 text-sm text-text-dim">
          Riwayat terbaru untuk transaksi finance, planning, dan perubahan profile.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead>
              <tr>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Waktu
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Actor
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Action
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Entity
                </th>
                <th className="border-b border-line px-3 py-3 text-left uppercase tracking-wide text-text-dim">
                  Metadata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(systemAuditLogs ?? []).map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-3 text-text-dim">{formatDateTime(log.created_at)}</td>
                  <td className="px-3 py-3 text-text-dim">{log.actor_user_id ?? "System"}</td>
                  <td className="px-3 py-3 text-text">{log.action}</td>
                  <td className="px-3 py-3 text-text-dim">
                    {log.entity_type}
                    {log.entity_id ? ` / ${log.entity_id}` : ""}
                  </td>
                  <td className="max-w-md px-3 py-3 text-text-dim">
                    <code className="whitespace-pre-wrap break-words text-xs">
                      {JSON.stringify(log.metadata ?? {})}
                    </code>
                  </td>
                </tr>
              ))}
              {systemAuditLogs?.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-text-dim" colSpan={5}>
                    Belum ada audit mutasi sistem.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
