import { NextRequest, NextResponse } from "next/server";

function suggestMicroHabit(taskName: string, failCount: number) {
  const lowered = taskName.toLowerCase();

  if (/(dzikir)/i.test(lowered)) {
    return "Mulai dari 1 kalimat dzikir setelah Subuh hari ini.";
  }
  if (/(tilawah)/i.test(lowered)) {
    return "Mulai dari 1 ayat setelah Maghrib, lalu naikkan bertahap.";
  }
  if (/(push|squat|lari|run)/i.test(lowered)) {
    return "Kurangi target 30% selama 3 hari lalu evaluasi ulang.";
  }

  if (failCount >= 3) {
    return "Pecah task jadi durasi 5 menit agar lebih ringan dan konsisten.";
  }

  return "Pindahkan task ke jam paling realistis dan tambahkan reminder tunggal.";
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    taskName?: string;
    failCount?: number;
  };

  if (!body.taskName) {
    return NextResponse.json({ error: "taskName wajib diisi" }, { status: 400 });
  }

  const failCount = body.failCount ?? 1;
  const recommendation = suggestMicroHabit(body.taskName, failCount);

  return NextResponse.json({
    taskName: body.taskName,
    failCount,
    recommendation,
  });
}
