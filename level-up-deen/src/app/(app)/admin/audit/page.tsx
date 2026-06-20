import { Card } from "@/components/ui/card";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { requireAdminContext, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAuthFailure } from "@/lib/auth";
import Link from "next/link";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const adminCheck = await requireAdminContext();
  if (isAuthFailure(adminCheck)) {
    redirect(routes.dashboard);
  }

  // Fallback checks
  isAdminRole("admin_system");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Audit Mutasi Sistem</h1>
        <p className="mt-2 text-sm text-text-dim">
          Pantau tabel <code>system_audit_logs</code> dan kelola riwayat aktivitas pengguna. Termasuk 
          log untuk <code>account_deletion_requests</code> (Request Delete Account).
        </p>
        <div className="mt-4 flex gap-3">
          <Link href={routes.admin} className="text-sm font-medium text-brand hover:underline">
            ← Kembali ke Admin Panel
          </Link>
        </div>
      </Card>

      <AuditLogViewer />
    </div>
  );
}
