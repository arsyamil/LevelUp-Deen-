import Link from "next/link";
import { Card } from "@/components/ui/card";
import { UserRoleManagement } from "@/components/admin/user-role-management";
import { AnalyticsCharts, ChartData } from "@/components/admin/analytics-charts";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const admin = createSupabaseAdminClient();

  // Mock DAU Data (Trending up)
  const userActivityData: ChartData[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString("id-ID", { weekday: 'short' }),
      users: Math.floor(Math.random() * 50) + 100 + (i * 10),
    };
  });

  // Fetch real Financial data from the last 7 days
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: txs } = await admin
    .from("financial_transactions")
    .select("transaction_date, amount, type")
    .gte("transaction_date", lastWeek);

  const txMap = new Map<string, { income: number; expense: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    txMap.set(dateStr, { income: 0, expense: 0 });
  }

  if (txs) {
    for (const tx of txs) {
      const dStr = tx.transaction_date.split('T')[0];
      if (txMap.has(dStr)) {
        const v = txMap.get(dStr)!;
        if (tx.type === 'income') v.income += tx.amount;
        if (tx.type === 'expense') v.expense += tx.amount;
      }
    }
  }

  const financeData: ChartData[] = Array.from(txMap.entries()).map(([k, v]) => ({
    date: new Date(k).toLocaleDateString("id-ID", { weekday: 'short' }),
    income: v.income,
    expense: v.expense,
  }));

  return (
    <main className="container-shell py-12 space-y-8">
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
        <AnalyticsCharts userActivityData={userActivityData} financeData={financeData} />
      </div>

      <div className="mt-8">
        <UserRoleManagement />
      </div>
    </main>
  );
}
