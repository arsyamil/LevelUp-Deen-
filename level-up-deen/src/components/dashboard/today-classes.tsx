"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Schedule {
  id: string;
  start_time: string;
  end_time: string;
  session_type: string;
  room: string | null;
  course: {
    course_name: string;
    color: string;
  } | null;
}

export function TodayClasses() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const today = new Date().getDay();
        const res = await fetch(`/api/study/schedules?day=${today}`);
        const json = await res.json();
        setSchedules(json.schedules || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, []);

  if (loading) {
    return (
      <Card className="p-5">
        <h2 className="section-title mb-4">Kelas Hari Ini 🎓</h2>
        <p className="text-sm text-text-dim">Memuat jadwal...</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">Kelas Hari Ini 🎓</h2>
        <Link href="/study" className="text-xs text-brand hover:underline">
          Lihat Study Tracker →
        </Link>
      </div>
      
      {schedules.length === 0 ? (
        <p className="text-sm text-text-dim">
          Tidak ada jadwal kelas hari ini. Waktunya mengerjakan tugas atau bersantai! 🎉
        </p>
      ) : (
        <ul className="space-y-3">
          {schedules.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-lg border border-line bg-bg-soft p-3">
              <div
                className="h-10 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: s.course?.color ?? "#6366f1" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{s.course?.course_name ?? "—"}</p>
                <p className="text-xs text-text-dim mt-0.5">
                  {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)} · {s.session_type}
                  {s.room && ` · ${s.room}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
