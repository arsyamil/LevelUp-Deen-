import { Card } from "@/components/ui/card";
import { AccountDeletionCard } from "@/components/settings/account-deletion-card";
import { DataExportCard } from "@/components/settings/data-export-card";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { ReminderPreferencesCard } from "@/components/settings/reminder-preferences-card";
import { getCurrentUserProfile } from "@/lib/user";

export default async function SettingsPage() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-text-dim">
          Pengelolaan profil, reminder, export data, dan delete account.
        </p>
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

      <DataExportCard />

      <AccountDeletionCard />
    </div>
  );
}
