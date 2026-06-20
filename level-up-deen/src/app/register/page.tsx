"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routes } from "@/lib/routes";
import { useTranslation } from "@/components/providers";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuestLogin = async () => {
    setError(null);
    setGuestLoading(true);
    const supabase = createSupabaseBrowserClient();
    
    const { error: signInError } = await supabase.auth.signInAnonymously();
    
    if (signInError) {
      setError(signInError.message + " (Pastikan Anonymous Sign-In aktif di Supabase)");
      setGuestLoading(false);
      return;
    }
    
    router.push(routes.onboarding);
    router.refresh();
  };

  const handleGoogleRegister = async () => {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: signUpError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${routes.onboarding}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("passwordMin6"));
      return;
    }

    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${routes.onboarding}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push(routes.onboarding);
    router.refresh();
  };

  return (
    <main className="cosmic-section min-h-screen">
      <div className="cosmic-orb left-1/2 top-12 -translate-x-1/2" />
      <Card className="mx-auto max-w-md p-8">
        <div className="cosmic-heading-glow">
          <h1 className="cosmic-gradient-text text-3xl font-semibold uppercase tracking-[0.08em]">
            {t("registerTitle")}
          </h1>
        </div>
        <p className="mt-2 text-sm text-text-dim">
          {t("registerDesc")}
        </p>

        <div className="mt-8 space-y-6">
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="flex w-full items-center justify-center gap-3 rounded border border-line-medium bg-bg-soft px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-text transition hover:border-line-strong hover:text-brand-strong"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            {t("continueWithGoogle")}
      </button>

      <button
        type="button"
        onClick={handleGuestLogin}
        disabled={guestLoading || loading}
        className="flex w-full items-center justify-center gap-3 rounded border border-line-medium bg-bg-card px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-text transition hover:border-brand hover:text-brand"
      >
        {guestLoading ? "Memproses..." : "Mulai sebagai Guest"}
      </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg-card px-2 text-text-dim">{t("orWithEmail")}</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
            <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium">
              {t("email")}
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium">
              {t("password")}
            </label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordMin6")}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="register-confirm" className="mb-1.5 block text-sm font-medium">
              {t("confirmPassword")}
            </label>
            <input
              id="register-confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("repeatPassword")}
              className="input-field"
            />
          </div>

          {error && (
            <p className="rounded border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            {loading ? t("processing") : t("signUpBtn")}
          </Button>
          </form>
        </div>

        <p className="mt-6 text-sm text-text-dim">
          {t("alreadyHaveAccount")}
          <Link href={routes.login} className="font-medium text-brand">
            {t("loginHere")}
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
