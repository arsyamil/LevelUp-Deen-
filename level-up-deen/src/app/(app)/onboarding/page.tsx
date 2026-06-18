import { Card } from "@/components/ui/card";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Onboarding & Personalization Engine</h1>
        <p className="mt-2 text-sm text-text-dim">
          Isi data profil dan prioritasmu agar sistem bisa membuat target harian yang relevan.
        </p>
      </Card>

      <OnboardingForm />
    </div>
  );
}
