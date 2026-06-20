import { Card } from "@/components/ui/card";
import { StudyTrackerClient } from "./study-client";

export default async function StudyPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">📚 Study Tracker</h1>
        <p className="mt-2 text-sm text-text-dim">
          Kelola jadwal kuliah, dosen pengampu, dan deadline tugas perkuliahan kamu.
        </p>
      </Card>

      <StudyTrackerClient />
    </div>
  );
}
