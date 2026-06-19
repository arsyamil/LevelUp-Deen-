import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

const SYSTEM_PROMPT = `Kamu adalah "Coach Deen", AI Life Coach personal di aplikasi Level Up Deen.

Peran & Kepribadianmu:
- Kamu adalah sahabat dan mentor yang suportif, empatik, dan pengertian.
- Gunakan sapaan santai tapi sopan (aku-kamu, atau panggil nama user jika ada). Hindari bahasa kaku seperti robot.
- Kamu mendengarkan curhatan pengguna terkait apa saja (ibadah, kesehatan, keuangan, masalah hidup, dll). Jangan hanya terpaku pada intent tertentu. Bebas ngobrol!
- Berikan motivasi Islami secara natural (boleh mengutip ayat/hadits pendek jika relevan, tapi jangan dipaksakan).
- Kamu bukan ustadz pemberi fatwa, melainkan teman ngobrol yang mendukung produktivitas.

Gaya Komunikasi:
- Jawab selayaknya membalas pesan chat: 1-2 paragraf singkat, hangat, dan to the point.
- Gunakan emoji secukupnya.
- Jangan menyebutkan data sistem (seperti level atau streak) secara kaku. Gunakan secara alami hanya jika relevan memotivasi (misal: "Wah, streak shalatmu udah 5 hari, semangat terus ya!").
- Jangan pernah memberikan fatwa hukum agama atau saran medis spesifik.`;

export type CoachIntent =
  | "burnout"
  | "time_management"
  | "consistency_drop"
  | "finance_discipline";

// Fallback responses kalau Gemini tidak tersedia
const fallbackResponses: Record<CoachIntent, string> = {
  burnout:
    "Istirahat sejenak itu bagian dari ikhtiar. Fokuskan hari ini pada versi minimum: shalat tepat waktu, dzikir singkat, dan satu tugas prioritas.",
  time_management:
    "Pisahkan hari menjadi blok kecil: ibadah wajib dulu, lalu deep work 25 menit, kemudian jeda 5 menit. Gunakan quest kecil agar ritme tetap terjaga.",
  consistency_drop:
    "Saat konsistensi turun, turunkan target, jangan turunkan niat. Jalankan micro-habit selama 3 hari untuk membangun momentum lagi.",
  finance_discipline:
    "Catat semua pengeluaran hari ini dulu tanpa menilai. Setelah itu pilih 1 kategori yang bisa ditekan 10% minggu ini agar target tabungan tetap aman.",
};

const fallbackGeneric =
  "Tetap ringkas dan fokus pada langkah kecil: mulai dari target paling mudah hari ini, lalu evaluasi kembali besok.";

export function getCoachResponse(intent: CoachIntent): string {
  return fallbackResponses[intent];
}

export function getCoachAnswer(message: string, intent?: CoachIntent): string {
  const normalized = message.trim().toLowerCase();
  if (intent) return fallbackResponses[intent];
  if (/(burnout|lelah|stres|stress)/i.test(normalized)) return fallbackResponses.burnout;
  if (/(waktu|time|sibuk)/i.test(normalized)) return fallbackResponses.time_management;
  if (/(konsistensi|tidak konsisten|drop|turun)/i.test(normalized)) return fallbackResponses.consistency_drop;
  if (/(uang|finansial|tabungan|pengeluaran|budget)/i.test(normalized)) return fallbackResponses.finance_discipline;
  return fallbackGeneric;
}

export interface CoachMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

export async function getGeminiCoachAnswer(
  message: string,
  history: CoachMessage[] = [],
  intent?: CoachIntent,
  userContext?: {
    username?: string;
    level?: number;
    rank?: string;
    prayerStreak?: number;
    questStreak?: number;
    coins?: number;
  }
): Promise<string> {
  if (!GEMINI_API_KEY) {
    // Graceful fallback when no API key configured
    return intent ? fallbackResponses[intent] : fallbackGeneric;
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.85, // Higher temperature for more natural/varied responses
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    // Build context-enriched message
    let contextPrefix = "";
    if (userContext) {
      contextPrefix = `<system_context>User profile: name=${userContext.username ?? "anonim"}, level=${userContext.level ?? 1}, rank=${userContext.rank ?? "E"}, prayer_streak=${userContext.prayerStreak ?? 0}, quest_streak=${userContext.questStreak ?? 0}, coins=${userContext.coins ?? 0}</system_context>\n\n`;
    }
    
    // We omit intent if it is burnout but the user typed something else, 
    // to allow free conversation. The UI handles sending natural messages now.
    
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(contextPrefix + message);
    const text = result.response.text();
    return text || fallbackGeneric;
  } catch {
    // Always degrade gracefully
    return intent ? fallbackResponses[intent] : fallbackGeneric;
  }
}
