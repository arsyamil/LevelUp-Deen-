"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SignUp } from "@clerk/nextjs";
import { routes } from "@/lib/routes";

export default function RegisterPage() {
  return (
    <main className="container-shell py-12">
      <Card className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Daftar Akun</h1>
        <p className="mt-2 text-sm text-text-dim">
          Buat akun baru dengan Clerk untuk mulai menyimpan progress harian Anda.
        </p>

        <div className="mt-8">
          <SignUp
            routing="hash"
            signInUrl={routes.login}
            redirectUrl={routes.onboarding}
          />
        </div>

        <p className="mt-6 text-sm text-text-dim">
          Sudah punya akun? <Link href={routes.login} className="font-medium text-brand">Masuk di sini</Link>.
        </p>
      </Card>
    </main>
  );
}
