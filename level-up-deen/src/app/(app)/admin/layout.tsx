import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/user";
import { isAdminRole } from "@/lib/auth";
import { routes } from "@/lib/routes";
import { Card } from "@/components/ui/card";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(routes.login);
  }

  if (!isAdminRole(profile.role)) {
    return (
      <main className="container-shell py-12">
        <Card className="max-w-2xl p-8">
          <h1 className="text-2xl font-semibold">Akses Admin Ditolak</h1>
          <p className="mt-4 text-sm text-text-dim">
            Halaman ini hanya tersedia untuk admin sistem. Jika Anda seorang user,
            akses data user lain tidak diperbolehkan oleh kebijakan keamanan.
          </p>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
