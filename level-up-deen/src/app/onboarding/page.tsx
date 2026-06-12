import { Card } from "@/components/ui/card";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/user";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(routes.login);
  }

  if (profile.onboardingCompleted) {
    redirect(routes.dashboard);
  }

  return (
    <main className="container-shell space-y-6 py-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Onboarding & Personalization Engine</h1>
        <p className="mt-2 text-sm text-text-dim">
          Isi data profil dan prioritasmu agar sistem bisa membuat target harian yang relevan.
        </p>
      </Card>

      <OnboardingForm />
    </main>
  );
}
