import { Card } from "@/components/ui/card";
import { AccountDeletionCard } from "@/components/settings/account-deletion-card";
import { DataExportCard } from "@/components/settings/data-export-card";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { ReminderPreferencesCard } from "@/components/settings/reminder-preferences-card";
import { PushSubscriptionCard } from "@/components/settings/push-subscription-card";
import { getCurrentUserProfile } from "@/lib/user";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { isAuthBypassEnabled } from "@/lib/env";
import { SettingsToggle } from "@/components/layout/settings-toggle";

export default async function SettingsPage() {
  const profile = await getCurrentUserProfile();
  const bypassEnabled = isAuthBypassEnabled();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-text-dim">
          Pengelolaan profil, reminder, export data, dan otentikasi akun.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="section-title mb-4">Preferensi Tampilan & Bahasa</h2>
        <SettingsToggle />
      </Card>

      {profile ? (
        <ProfileSettingsForm profile={profile} />
      ) : (
        <Card className="p-5">
          <h2 className="section-title">Profil</h2>
          <p className="mt-3 text-sm text-text-dim">
            Profil belum tersedia. Silakan login ulang atau selesaikan onboarding.
          </p>
        </Card>
      )}

      <ReminderPreferencesCard
        initialPrefs={{
          subuhReminderEnabled: true,
          waterReminderIntervalMin: 120,
          dailyReflectionTime: "20:30",
        }}
      />

      <PushSubscriptionCard />

      <DataExportCard />
      <AccountDeletionCard />

      <Card className="p-5 border-danger/20 bg-danger/5">
        <h2 className="section-title text-danger">Keluar Akun</h2>
        <p className="mt-2 mb-4 text-sm text-text-dim">
          Anda akan keluar dari sesi saat ini dan harus login kembali untuk mengakses data Anda.
        </p>
        <SignOutButton bypassEnabled={bypassEnabled} />
      </Card>
    </div>
  );
}
