import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getHostedSignUpUrl } from "@/lib/clerk-portal";
import { routes } from "@/lib/routes";

export default function RegisterPage() {
  const hostedSignUpUrl = getHostedSignUpUrl();

  return (
    <main className="container-shell py-12">
      <Card className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Daftar Akun</h1>
        <p className="mt-2 text-sm text-text-dim">
          Buat akun baru dengan Clerk untuk mulai menyimpan progress harian Anda.
        </p>

        <div className="mt-8 rounded-xl border border-line bg-bg-soft p-4 text-sm text-text-dim">
          <p>Daftar melalui halaman Clerk yang aman, lalu kembali otomatis ke onboarding.</p>
          <a
            href={hostedSignUpUrl}
            className="mt-3 inline-flex rounded-xl bg-brand px-4 py-2 font-semibold text-black transition hover:bg-brand-strong"
          >
            Buka daftar Clerk
          </a>
        </div>

        <p className="mt-6 text-sm text-text-dim">
          Sudah punya akun?{" "}
          <Link href={routes.login} className="font-medium text-brand">
            Masuk di sini
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
