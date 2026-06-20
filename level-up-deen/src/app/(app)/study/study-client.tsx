"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startStudyReminders, stopStudyReminders } from "@/lib/study-reminders";

const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

interface Course {
  id: string;
  course_name: string;
  course_code: string | null;
  lecturer_name: string | null;
  semester: string | null;
  color: string;
}

interface Schedule {
  id: string;
  course_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  session_type: string;
  room: string | null;
  building: string | null;
  course: Course | null;
}

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  deadline_at: string;
  priority: string;
  is_completed: boolean;
  course: Pick<Course, "id" | "course_name" | "course_code" | "color"> | null;
}

type Tab = "schedules" | "courses" | "assignments";

export function StudyTrackerClient() {
  const [tab, setTab] = useState<Tab>("schedules");
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  function showMsg(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes, aRes] = await Promise.all([
        fetch("/api/study/courses"),
        fetch("/api/study/schedules"),
        fetch("/api/study/assignments"),
      ]);
      const [cJson, sJson, aJson] = await Promise.all([cRes.json(), sRes.json(), aRes.json()]);
      setCourses(cJson.courses ?? []);
      setSchedules(sJson.schedules ?? []);
      setAssignments(aJson.assignments ?? []);
    } catch {
      showMsg("Gagal memuat data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Start study reminder scheduler
  useEffect(() => {
    startStudyReminders();
    return () => stopStudyReminders();
  }, []);

  // ── Create Course ──
  const handleCreateCourse = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/study/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: form.get("courseName"),
          courseCode: form.get("courseCode") || undefined,
          lecturerName: form.get("lecturerName") || undefined,
          semester: form.get("semester") || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showMsg("Mata kuliah berhasil ditambahkan! 🎓", "success");
      setShowCourseForm(false);
      fetchAll();
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Gagal menambah mata kuliah", "error");
    }
  };

  // ── Create Schedule ──
  const handleCreateSchedule = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/study/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: form.get("courseId"),
          dayOfWeek: Number(form.get("dayOfWeek")),
          startTime: form.get("startTime"),
          endTime: form.get("endTime"),
          sessionType: form.get("sessionType") || "teori",
          room: form.get("room") || undefined,
          building: form.get("building") || undefined,
          reminderMinutes: Number(form.get("reminderMinutes")),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showMsg("Jadwal berhasil ditambahkan! 📅", "success");
      setShowScheduleForm(false);
      fetchAll();
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Gagal menambah jadwal", "error");
    }
  };

  // ── Create Assignment ──
  const handleCreateAssignment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/study/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: form.get("courseId"),
          title: form.get("title"),
          description: form.get("description") || undefined,
          deadlineAt: new Date(form.get("deadlineAt") as string).toISOString(),
          priority: form.get("priority") || "medium",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showMsg("Tugas berhasil ditambahkan! ✅", "success");
      setShowAssignmentForm(false);
      fetchAll();
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Gagal menambah tugas", "error");
    }
  };

  // ── Toggle assignment complete ──
  const toggleAssignment = async (id: string, isCompleted: boolean) => {
    try {
      await fetch("/api/study/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: id, isCompleted }),
      });
      fetchAll();
    } catch {
      showMsg("Gagal mengubah status tugas", "error");
    }
  };

  // ── Delete Actions ──
  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Hapus mata kuliah ini? Semua jadwal & tugas terkait mungkin akan hilang.")) return;
    try {
      await fetch(`/api/study/courses?id=${id}`, { method: "DELETE" });
      fetchAll();
    } catch {
      showMsg("Gagal menghapus mata kuliah", "error");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      await fetch(`/api/study/schedules?id=${id}`, { method: "DELETE" });
      fetchAll();
    } catch {
      showMsg("Gagal menghapus jadwal", "error");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Hapus tugas ini?")) return;
    try {
      await fetch(`/api/study/assignments?id=${id}`, { method: "DELETE" });
      fetchAll();
    } catch {
      showMsg("Gagal menghapus tugas", "error");
    }
  };

  const todayIndex = new Date().getDay();

  const inputClass =
    "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";
  const selectClass =
    "mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-text-dim">Memuat data study tracker...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-lg border p-3 text-sm ${
              message.type === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-danger/30 bg-danger/10 text-danger"
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="grid gap-2 sm:grid-cols-3">
        {(["schedules", "courses", "assignments"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              tab === t ? "border-brand bg-brand text-text" : "border-line bg-bg text-text-dim"
            }`}
          >
            {t === "schedules" && "📅 Jadwal"}
            {t === "courses" && "🎓 Mata Kuliah"}
            {t === "assignments" && "📝 Tugas"}
          </button>
        ))}
      </div>

      {/* ═══ TAB: Jadwal ═══ */}
      {tab === "schedules" && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Jadwal Hari Ini ({DAY_LABELS[todayIndex]})</h2>
              <Button size="sm" variant="primary" onClick={() => setShowScheduleForm(!showScheduleForm)}>
                {showScheduleForm ? "Batal" : "+ Tambah"}
              </Button>
            </div>

            {showScheduleForm && courses.length > 0 && (
              <form onSubmit={handleCreateSchedule} className="mt-4 space-y-3 rounded-xl border border-line bg-bg-soft p-4">
                <label className="block text-sm">
                  <span className="font-medium">Mata Kuliah</span>
                  <select name="courseId" required className={selectClass}>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.course_name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium">Hari</span>
                    <select name="dayOfWeek" required className={selectClass}>
                      {DAY_LABELS.map((day, i) => (
                        <option key={i} value={i}>{day}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">Tipe Sesi</span>
                    <select name="sessionType" className={selectClass}>
                      <option value="teori">Teori</option>
                      <option value="praktikum">Praktikum</option>
                      <option value="responsi">Responsi</option>
                      <option value="ujian">Ujian</option>
                    </select>
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium">Jam Mulai</span>
                    <input type="time" name="startTime" required className={inputClass} />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">Jam Selesai</span>
                    <input type="time" name="endTime" required className={inputClass} />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium">Ruangan</span>
                    <input type="text" name="room" placeholder="Contoh: Lab A3" className={inputClass} />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">Gedung</span>
                    <input type="text" name="building" placeholder="Contoh: FMIPA" className={inputClass} />
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="font-medium">Ingatkan Saya (Reminder)</span>
                  <select name="reminderMinutes" className={selectClass} defaultValue="30">
                    <option value="0">Tepat Waktu (0 menit)</option>
                    <option value="15">15 menit sebelum</option>
                    <option value="30">30 menit sebelum</option>
                    <option value="60">1 jam sebelum</option>
                    <option value="120">2 jam sebelum</option>
                  </select>
                </label>
                <Button type="submit" variant="primary" className="w-full">
                  Simpan Jadwal
                </Button>
              </form>
            )}

            {showScheduleForm && courses.length === 0 && (
              <p className="mt-4 text-sm text-text-dim">
                Belum ada mata kuliah. Tambah mata kuliah dulu di tab &quot;Mata Kuliah&quot;.
              </p>
            )}

            {/* Today's schedules */}
            {schedules.filter((s) => s.day_of_week === todayIndex).length === 0 ? (
              <p className="mt-4 text-sm text-text-dim">Tidak ada jadwal kuliah hari ini. 🎉</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {schedules
                  .filter((s) => s.day_of_week === todayIndex)
                  .map((s) => (
                    <motion.li
                      key={s.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-lg border border-line bg-bg-soft p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-1 rounded-full"
                          style={{ backgroundColor: s.course?.color ?? "#6366f1" }}
                        />
                        <div>
                          <p className="font-medium">{s.course?.course_name ?? "—"}</p>
                          <p className="text-xs text-text-dim">
                            {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)} · {s.session_type}
                            {s.room && ` · ${s.room}`}
                            {s.course?.lecturer_name && ` · ${s.course.lecturer_name}`}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteSchedule(s.id)} className="text-xs text-danger hover:underline">Hapus</button>
                    </motion.li>
                  ))}
              </ul>
            )}
          </Card>

          <Card className="p-5 overflow-x-auto">
            <h2 className="section-title mb-4">Jadwal Mingguan</h2>
            <div className="min-w-[700px]">
              <div className="grid grid-cols-8 border-b border-line pb-2">
                <div className="text-xs font-semibold text-text-dim text-center">Jam</div>
                {DAY_LABELS.map((day, i) => (
                  <div key={day} className={`text-xs font-semibold text-center ${i === todayIndex ? "text-brand" : "text-text-dim"}`}>
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="relative mt-2 h-[600px] border-l border-line ml-[12.5%]">
                {/* Horizontal lines for hours */}
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-line/50" style={{ top: `${(i / 14) * 100}%` }}>
                    <span className="absolute -left-12 -top-2.5 text-xs text-text-dim">{i + 7}:00</span>
                  </div>
                ))}

                {/* Vertical lines for days */}
                {DAY_LABELS.map((_, i) => (
                  <div key={`v-${i}`} className="absolute h-full border-l border-line/30" style={{ left: `${(i / 7) * 100}%` }} />
                ))}

                {/* Schedule Blocks */}
                {schedules.map((s) => {
                  const startHour = parseInt(s.start_time.split(":")[0]) + parseInt(s.start_time.split(":")[1]) / 60;
                  const endHour = parseInt(s.end_time.split(":")[0]) + parseInt(s.end_time.split(":")[1]) / 60;
                  const top = ((startHour - 7) / 14) * 100;
                  const height = ((endHour - startHour) / 14) * 100;
                  const left = (s.day_of_week / 7) * 100;
                  const width = 100 / 7;

                  // Skip if out of bounds (before 07:00 or after 21:00)
                  if (startHour < 7 || endHour > 21) return null;

                  return (
                    <div
                      key={s.id}
                      className="absolute rounded-md p-1.5 overflow-hidden border border-white/20 shadow-sm"
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: s.course?.color ?? "#6366f1",
                        color: "#fff",
                      }}
                    >
                      <p className="text-[10px] font-bold leading-tight line-clamp-2">{s.course?.course_name}</p>
                      <p className="text-[9px] opacity-90">{s.start_time.slice(0, 5)}</p>
                      <p className="text-[9px] opacity-80 mt-0.5">{s.room}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ TAB: Mata Kuliah ═══ */}
      {tab === "courses" && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Daftar Mata Kuliah ({courses.length})</h2>
              <Button size="sm" variant="primary" onClick={() => setShowCourseForm(!showCourseForm)}>
                {showCourseForm ? "Batal" : "+ Tambah"}
              </Button>
            </div>

            {showCourseForm && (
              <form onSubmit={handleCreateCourse} className="mt-4 space-y-3 rounded-xl border border-line bg-bg-soft p-4">
                <label className="block text-sm">
                  <span className="font-medium">Nama Mata Kuliah *</span>
                  <input type="text" name="courseName" required maxLength={200} placeholder="Contoh: Kalkulus II" className={inputClass} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium">Kode MK</span>
                    <input type="text" name="courseCode" maxLength={30} placeholder="Contoh: MAT201" className={inputClass} />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">Semester</span>
                    <input type="text" name="semester" maxLength={20} placeholder="Contoh: Genap 2026" className={inputClass} />
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="font-medium">Dosen Pengampu</span>
                  <input type="text" name="lecturerName" maxLength={200} placeholder="Contoh: Dr. Fatimah, M.Si." className={inputClass} />
                </label>
                <Button type="submit" variant="primary" className="w-full">
                  Simpan Mata Kuliah
                </Button>
              </form>
            )}

            {courses.length === 0 ? (
              <p className="mt-4 text-sm text-text-dim">Belum ada mata kuliah. Tambahkan sekarang! 🎓</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {courses.map((c) => (
                  <motion.li
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-lg border border-line bg-bg-soft p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-1 rounded-full" style={{ backgroundColor: c.color }} />
                      <div>
                        <p className="font-medium">
                          {c.course_name}
                          {c.course_code && <span className="ml-2 text-xs text-text-dim">({c.course_code})</span>}
                        </p>
                        {c.lecturer_name && <p className="text-xs text-text-dim">👨‍🏫 {c.lecturer_name}</p>}
                        {c.semester && <p className="text-xs text-text-dim">📅 {c.semester}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCourse(c.id)} className="text-xs text-danger hover:underline">Hapus</button>
                  </motion.li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {/* ═══ TAB: Tugas ═══ */}
      {tab === "assignments" && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Tugas & Deadline</h2>
              <Button size="sm" variant="primary" onClick={() => setShowAssignmentForm(!showAssignmentForm)}>
                {showAssignmentForm ? "Batal" : "+ Tambah"}
              </Button>
            </div>

            {showAssignmentForm && courses.length > 0 && (
              <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3 rounded-xl border border-line bg-bg-soft p-4">
                <label className="block text-sm">
                  <span className="font-medium">Mata Kuliah</span>
                  <select name="courseId" required className={selectClass}>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.course_name}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-medium">Judul Tugas *</span>
                  <input type="text" name="title" required maxLength={255} placeholder="Contoh: Tugas Makalah BAB 3" className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="font-medium">Deskripsi</span>
                  <input type="text" name="description" placeholder="Keterangan tambahan (opsional)" className={inputClass} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium">Deadline *</span>
                    <input type="datetime-local" name="deadlineAt" required className={inputClass} />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">Prioritas</span>
                    <select name="priority" className={selectClass}>
                      <option value="low">Rendah</option>
                      <option value="medium" selected>Sedang</option>
                      <option value="high">Tinggi</option>
                    </select>
                  </label>
                </div>
                <Button type="submit" variant="primary" className="w-full">
                  Simpan Tugas
                </Button>
              </form>
            )}

            {showAssignmentForm && courses.length === 0 && (
              <p className="mt-4 text-sm text-text-dim">
                Belum ada mata kuliah. Tambah dulu di tab &quot;Mata Kuliah&quot;.
              </p>
            )}

            {assignments.length === 0 ? (
              <p className="mt-4 text-sm text-text-dim">Tidak ada tugas yang tertunda. Kerja bagus! 🚀</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {assignments.map((a) => {
                  const deadline = new Date(a.deadline_at);
                  const now = new Date();
                  const diffHours = (deadline.getTime() - now.getTime()) / 3600000;
                  const isUrgent = diffHours < 24 && diffHours > 0;
                  const isOverdue = diffHours < 0;
                  const priorityColors: Record<string, string> = {
                    high: "border-danger/40 bg-danger/5",
                    medium: "border-amber-400/40 bg-amber-400/5",
                    low: "border-line bg-bg-soft",
                  };

                  return (
                    <motion.li
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        a.is_completed ? "border-line bg-bg-soft opacity-60" : priorityColors[a.priority] ?? "border-line bg-bg-soft"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleAssignment(a.id, !a.is_completed)}
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs transition ${
                            a.is_completed
                              ? "border-success bg-success text-white"
                              : "border-line hover:border-brand"
                          }`}
                        >
                          {a.is_completed && "✓"}
                        </button>
                        <div>
                          <p className={`font-medium ${a.is_completed ? "line-through" : ""}`}>{a.title}</p>
                          <p className="text-xs text-text-dim">
                            {a.course?.course_name ?? "—"} ·{" "}
                            <span className={isOverdue ? "text-danger font-semibold" : isUrgent ? "text-amber-400 font-semibold" : ""}>
                              {isOverdue ? "Terlambat!" : deadline.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteAssignment(a.id)} className="text-xs text-danger hover:underline ml-3 shrink-0">Hapus</button>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
