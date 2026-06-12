import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getHostedSignInUrl } from "@/lib/clerk-portal";
import { routes } from "@/lib/routes";

export default function LoginPage() {
  const hostedSignInUrl = getHostedSignInUrl();

  return (
    <main className="container-shell py-12">
      <Card className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-text-dim">
          Masuk dengan Clerk untuk mengakses profil pribadi Anda.
        </p>

        <div className="mt-8 rounded-xl border border-line bg-bg-soft p-4 text-sm text-text-dim">
          <p>Masuk melalui halaman Clerk yang aman, lalu kembali otomatis ke dashboard.</p>
          <a
            href={hostedSignInUrl}
            className="mt-3 inline-flex rounded-xl bg-brand px-4 py-2 font-semibold text-black transition hover:bg-brand-strong"
          >
            Buka login Clerk
          </a>
        </div>

        <p className="mt-6 text-sm text-text-dim">
          Belum punya akun?{" "}
          <Link href={routes.register} className="font-medium text-brand">
            Daftar di sini
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
