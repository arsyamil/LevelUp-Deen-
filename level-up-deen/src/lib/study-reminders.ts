"use client";

/**
 * Study Reminder Scheduler
 *
 * Uses the browser Notification API (via service worker) to schedule
 * local reminders for upcoming classes and assignment deadlines.
 *
 * This runs client-side and checks every minute for upcoming events.
 */


interface StudySchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  session_type: string;
  room: string | null;
  reminder_minutes: number;
  course: {
    course_name: string;
    lecturer_name: string | null;
  } | null;
}

interface StudyAssignment {
  id: string;
  title: string;
  deadline_at: string;
  is_completed: boolean;
  course: {
    course_name: string;
  } | null;
}

// Track which reminders have already been sent to avoid duplicates
const sentReminders = new Set<string>();

function sendNotification(title: string, body: string, url: string = "/study") {
  if ("Notification" in window && Notification.permission === "granted") {
    // Use service worker registration if available
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          data: { url },
          tag: `study-${Date.now()}`,
        });
      });
    } else {
      // Fallback: standard Notification
      new Notification(title, { body, icon: "/icon-192x192.png" });
    }
  }
}

function checkScheduleReminders(schedules: StudySchedule[]) {
  const now = new Date();
  const todayIndex = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todaySchedules = schedules.filter((s) => s.day_of_week === todayIndex);

  for (const schedule of todaySchedules) {
    const [startH, startM] = schedule.start_time.split(":").map(Number);
    const classMinutes = startH * 60 + startM;
    const reminderBefore = schedule.reminder_minutes || 30;
    const reminderTime = classMinutes - reminderBefore;

    const key = `schedule-${schedule.id}-${todayIndex}-${now.toDateString()}`;
    if (sentReminders.has(key)) continue;

    // Check if we're within the reminder window (±1 minute)
    if (currentMinutes >= reminderTime && currentMinutes <= reminderTime + 1) {
      const courseName = schedule.course?.course_name ?? "Kuliah";
      const room = schedule.room ? ` di ${schedule.room}` : "";
      const lecturer = schedule.course?.lecturer_name ? ` (${schedule.course.lecturer_name})` : "";

      sendNotification(
        `📚 ${courseName} dalam ${reminderBefore} menit`,
        `${schedule.session_type} mulai ${schedule.start_time.slice(0, 5)}${room}${lecturer}`,
        "/study"
      );
      sentReminders.add(key);
    }
  }
}

function checkAssignmentReminders(assignments: StudyAssignment[]) {
  const now = new Date();

  for (const assignment of assignments) {
    if (assignment.is_completed) continue;

    const deadline = new Date(assignment.deadline_at);
    const hoursUntil = (deadline.getTime() - now.getTime()) / 3600000;

    // Remind at 24 hours before
    const key24 = `assignment-24h-${assignment.id}`;
    if (hoursUntil > 23.5 && hoursUntil <= 24.5 && !sentReminders.has(key24)) {
      const courseName = assignment.course?.course_name ?? "";
      sendNotification(
        `⏰ Deadline besok: ${assignment.title}`,
        `${courseName} · Deadline: ${deadline.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`,
        "/study"
      );
      sentReminders.add(key24);
    }

    // Remind at 1 hour before
    const key1 = `assignment-1h-${assignment.id}`;
    if (hoursUntil > 0.5 && hoursUntil <= 1.5 && !sentReminders.has(key1)) {
      const courseName = assignment.course?.course_name ?? "";
      sendNotification(
        `🚨 Deadline 1 jam lagi: ${assignment.title}`,
        `${courseName} · Segera selesaikan!`,
        "/study"
      );
      sentReminders.add(key1);
    }
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startStudyReminders() {
  if (intervalId) return; // Already running

  // Request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  async function check() {
    try {
      const [sRes, aRes] = await Promise.all([
        fetch("/api/study/schedules"),
        fetch("/api/study/assignments"),
      ]);
      const [sJson, aJson] = await Promise.all([sRes.json(), aRes.json()]);

      checkScheduleReminders(sJson.schedules ?? []);
      checkAssignmentReminders(aJson.assignments ?? []);
    } catch {
      // Silently ignore errors
    }
  }

  // Check immediately, then every 60 seconds
  check();
  intervalId = setInterval(check, 60_000);
}

export function stopStudyReminders() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
