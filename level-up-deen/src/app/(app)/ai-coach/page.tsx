import { CoachChat } from "@/components/ai-coach/coach-chat";

export default async function AICoachPage() {
  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] lg:h-[calc(100vh-140px)]">
      <CoachChat />
    </div>
  );
}
