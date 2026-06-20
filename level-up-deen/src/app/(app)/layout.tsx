import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/app-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserProfile, getCurrentUserDashboardData } from "@/lib/user";
import { routes } from "@/lib/routes";
import { isAdminRole } from "@/lib/auth";
import { isAuthBypassEnabled } from "@/lib/env";
import { ReactNode } from "react";

import { MobileMenu } from "@/components/layout/mobile-menu";

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
          <div className="flex items-center gap-2">
            <MobileMenu showAdmin={showAdmin} />
            <Link href={routes.dashboard} className="cosmic-gradient-text font-semibold uppercase tracking-[0.12em]">
              LEVEL UP DEEN
            </Link>
          </div>
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
            <Link 
              href={routes.settings}
              className="p-2 text-text-dim hover:text-text transition-colors"
              aria-label="Pengaturan"
              title="Pengaturan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </Link>
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
