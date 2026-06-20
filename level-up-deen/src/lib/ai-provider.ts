import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const systemPrompt = `Kamu adalah 'Level Up Deen Coach', seorang mentor virtual yang bersahabat, islami, dan berfokus pada produktivitas.
Tugas utamamu adalah memberikan nasihat yang memotivasi pengguna untuk menyeimbangkan dunia (kuliah, keuangan, produktivitas) dan akhirat (ibadah, tilawah, sedekah).
Gunakan bahasa Indonesia yang santai tapi sopan, ala anak muda/mahasiswa. Jangan terlalu kaku.
Berikan saran praktis, dan sekali-sekali selipkan kutipan hadits, ayat Al-Quran, atau pepatah Islami jika sangat relevan.
Jangan berikan respon yang terlalu panjang, usahakan padat, jelas, dan memotivasi.
Ingat: Kamu BUKAN chatbot umum, kamu HANYA fokus pada perbaikan diri (self-improvement) dalam koridor Islam.`;

/**
 * Generate advice based on user data context and optional user query
 */
export async function generateCoachAdvice(
  context: {
    userName: string;
    level: number;
    tasksRemaining: number;
    savings: number;
    expense: number;
  },
  userMessage?: string
) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const contextString = `
[DATA PENGGUNA SAAT INI]
- Nama: ${context.userName}
- Level: ${context.level}
- Tugas tertunda: ${context.tasksRemaining}
- Tabungan/Saldo: Rp ${context.savings}
- Pengeluaran: Rp ${context.expense}
`;

  const prompt = userMessage
    ? `${systemPrompt}\n${contextString}\nPengguna bertanya/berkata: "${userMessage}"\nBerikan balasan untuk pengguna:`
    : `${systemPrompt}\n${contextString}\nBerikan sapaan dan 1 saran singkat untuk pengguna berdasarkan data di atas hari ini:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
