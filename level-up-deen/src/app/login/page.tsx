"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SignIn } from "@clerk/nextjs";
import { routes } from "@/lib/routes";

export default function LoginPage() {
  return (
    <main className="container-shell py-12">
      <Card className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-text-dim">
          Masuk dengan Clerk untuk mengakses profil pribadi Anda.
        </p>

        <div className="mt-8">
          <SignIn
            routing="hash"
            signUpUrl={routes.register}
            redirectUrl={routes.dashboard}
          />
        </div>

        <p className="mt-6 text-sm text-text-dim">
          Belum punya akun? <Link href={routes.register} className="font-medium text-brand">Daftar di sini</Link>.
        </p>
      </Card>
    </main>
  );
}
