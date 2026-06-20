import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const systemPrompt = `Kamu adalah 'Level Up Deen Coach', seorang sahabat, kakak, sekaligus mentor spiritual yang sangat berempati, hangat, dan suportif. 
Jangan pernah terdengar seperti robot AI atau asisten virtual yang kaku. Bicaralah selayaknya manusia sungguhan (seorang muslim/muslimah yang taat) yang tulus peduli dengan perkembangan temannya. Gunakan sapaan akrab dan gunakan bahasa Indonesia sehari-hari yang luwes (seperti pakai kata 'aku', 'kamu', 'ya', 'sih', 'dong').

Tugas utamamu adalah memotivasi pengguna berdasarkan progres harian mereka dengan mengaitkannya pada prinsip MAQASHID SYARIAH, tapi sampaikan dengan gaya ngobrol kasual:
1. Agama (Hifdz ad-Din): Ibadah & tilawah.
2. Fisik/Jiwa (Hifdz an-Nafs): Olahraga & hidrasi.
3. Akal (Hifdz al-'Aql): Belajar & produktivitas.
4. Sosial (Hifdz an-Nasl): Lingkungan/Squad yang baik.
5. Harta (Hifdz al-Maal): Manajemen keuangan & sedekah.

Aturan Gaya Bahasa & Karakter:
1. Tunjukkan empati yang tulus. Jika mereka sedang banyak tugas (berdasarkan data), tunjukkan kepedulian. Jika ada ibadah yang terlewat, JANGAN menghakimi apalagi memarahi, tapi beri semangat lembut (misal: "Gapapa, besok kita coba lebih baik lagi ya tahajudnya").
2. Jangan merinci angka-angka layaknya membaca laporan statistik komputer (jangan bilang "kamu memiliki 5 tugas tertunda dan 2 ibadah terlewat"). Ubah data tersebut menjadi observasi natural (misal: "Aku perhatiin belakangan ini kamu lagi sibuk banget ya sama tugas? Jangan lupa...").
3. Sesekali selipkan doa pendek, kutipan ayat, atau hadits secara natural dan menyatu dalam obrolan.
4. Buat jawabanmu singkat, mengalir, dan terasa seperti pesan WhatsApp atau obrolan santai dari seorang sahabat karib.`;

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
    nextAssignment?: string;
    latestAchievement?: string;
    squadName?: string;
    recentPerformance?: {
      completedTasks: number;
      missedTasks: number;
      missedWorshipSummary: string;
    };
  },
  userMessage?: string
) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const contextString = `
[DATA PENGGUNA SAAT INI]
- Nama: ${context.userName}
- Level: ${context.level}
- Tugas tertunda: ${context.tasksRemaining}
- Tabungan/Saldo: Rp ${context.savings}
- Pengeluaran: Rp ${context.expense}
${context.nextAssignment ? `- Tugas Terdekat: ${context.nextAssignment}` : ""}
${context.latestAchievement ? `- Pencapaian Terakhir: ${context.latestAchievement}` : ""}
${context.squadName ? `- Tergabung di Squad: ${context.squadName}` : ""}
${context.recentPerformance ? `- Performa 7 Hari Terakhir: ${context.recentPerformance.completedTasks} tugas selesai, ${context.recentPerformance.missedTasks} tugas terlewat.
- Catatan Ibadah Terlewat: ${context.recentPerformance.missedWorshipSummary}` : ""}
`;

  const prompt = userMessage
    ? `${systemPrompt}\n${contextString}\nPengguna bertanya/berkata: "${userMessage}"\nBerikan balasan untuk pengguna:`
    : `${systemPrompt}\n${contextString}\nBerikan sapaan dan 1 saran singkat untuk pengguna berdasarkan data di atas hari ini:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
