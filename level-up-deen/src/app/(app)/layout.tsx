import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/app-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUserProfile, getCurrentUserDashboardData } from "@/lib/user";
import { routes } from "@/lib/routes";
import { isAdminRole } from "@/lib/auth";
import { isAuthBypassEnabled } from "@/lib/env";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const bypassEnabled = isAuthBypassEnabled();
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(routes.login);
  }

  if (!bypassEnabled && !profile.onboardingCompleted) {
    redirect(routes.onboarding);
  }

  const dashboardData = await getCurrentUserDashboardData(profile);
  const username = profile.username ?? profile.email.split("@")[0] ?? "Pengguna";
  const role = profile.role;
  const showAdmin = isAdminRole(role);
  const stats = dashboardData?.stats;

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="container-shell flex h-16 items-center justify-between">
          <Link href={routes.dashboard} className="cosmic-gradient-text font-semibold uppercase tracking-[0.12em]">
            LEVEL UP DEEN
          </Link>
          <div className="flex items-center gap-3">
            {stats && (
              <div className="hidden items-center gap-3 text-sm sm:flex">
                <span className="text-text-dim">Lv.{stats.level}</span>
                <span className="text-text-dim">·</span>
                <span className="text-text-dim">{stats.coins} 🪙</span>
                <span className="text-text-dim">·</span>
                <Badge variant="brand">{stats.rank}-Rank</Badge>
              </div>
            )}
            <SignOutButton bypassEnabled={bypassEnabled} />
          </div>
        </div>
      </header>

      <div className="container-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block">
            <Card className="sticky top-[69px] p-4">
              <div className="mb-4 flex items-center gap-3 rounded border border-line bg-bg p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-line-strong bg-brand-soft text-sm font-bold text-brand-strong">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{username}</p>
                  <p className="text-xs text-text-dim">{role ?? "user"}</p>
                </div>
              </div>
              <AppNav showAdmin={showAdmin} />
            </Card>
          </aside>

          {/* Main content */}
          <main className="min-h-[70vh]">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
