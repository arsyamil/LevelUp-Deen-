import Link from "next/link";
import { Card } from "@/components/ui/card";
import { UserRoleManagement } from "@/components/admin/user-role-management";

export default async function AdminPage() {
  return (
    <main className="container-shell py-12">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold">Admin Console</h1>
          <p className="mt-3 text-sm text-text-dim">
            Halo Admin. Di sini Anda dapat mengelola master data, memantau
            konfigurasi sistem, dan meninjau penugasan role tanpa mengakses data
            pribadi user lain.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card className="rounded-3xl p-5">
              <h2 className="text-base font-semibold">Role Separation</h2>
              <p className="mt-2 text-sm text-text-dim">
                User biasa hanya dapat mengakses data miliknya sendiri. Admin
                system bertugas mengelola konfigurasi sistem dan master data.
              </p>
            </Card>
            <Card className="rounded-3xl p-5">
              <h2 className="text-base font-semibold">Audit Safe</h2>
              <p className="mt-2 text-sm text-text-dim">
                Semua tindakan admin tercatat dan diatur oleh kebijakan RLS
                Supabase, sehingga integritas data user tetap terjaga.
              </p>
            </Card>
          </div>
        </Card>

        <Card className="rounded-3xl border border-line bg-bg-soft p-5">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="mt-2 text-sm text-text-dim">
            Kelola role pengguna dari panel di bawah. Hanya admin system dapat
            melakukan perubahan role pada akun terdaftar.
          </p>
          <div className="mt-4">
            <Link
              href="/admin/audit"
              className="inline-flex rounded-2xl border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              Lihat Riwayat Audit
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <UserRoleManagement />
      </div>
    </main>
  );
}
