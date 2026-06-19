"use client";

import { useEffect, useRef, useState } from "react";
import { CoachIntent, CoachMessage } from "@/lib/ai-coach";

const intents: { key: CoachIntent; label: string; emoji: string; prompt: string }[] = [
  { key: "burnout", label: "Burnout", emoji: "😮‍💨", prompt: "Aku merasa agak lelah dan burnout akhir-akhir ini. Punya saran biar semangat lagi?" },
  { key: "time_management", label: "Manajemen Waktu", emoji: "⏰", prompt: "Gimana ya caranya biar aku bisa ngatur waktu lebih baik setiap hari?" },
  { key: "consistency_drop", label: "Konsistensi Drop", emoji: "📉", prompt: "Akhir-akhir ini kebiasaan baikku lagi drop nih. Tolong bantu dong." },
  { key: "finance_discipline", label: "Disiplin Finansial", emoji: "💰", prompt: "Aku lagi susah banget disiplin soal uang. Punya tips praktis?" },
];

interface ConversationItem {
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
}

export function CoachChat() {
  const [intent, setIntent] = useState<CoachIntent>("burnout");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [history, setHistory] = useState<CoachMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSend = async (overrideMessage?: string) => {
    const text = (overrideMessage ?? message).trim();
    if (!text && !intent) return;
    if (loading) return;

    setError(null);
    setLoading(true);

    const defaultPrompt = intents.find((i) => i.key === intent)?.prompt || "Halo Coach!";
    const userText = text || defaultPrompt;

    setConversation((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "assistant", text: "", loading: true },
    ]);
    setMessage("");

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, message: userText, history }),
      });
      const payload = await res.json();

      if (!res.ok) throw new Error(payload.error ?? "Tidak dapat menghubungi AI Coach");

      const answer: string = payload.answer ?? "Tidak ada jawaban.";

      setConversation((prev) =>
        prev.map((item, idx) =>
          idx === prev.length - 1 && item.loading ? { role: "assistant", text: answer } : item
        )
      );

      // Update history for multi-turn
      setHistory((h) => [
        ...h,
        { role: "user", parts: [{ text: userText }] },
        { role: "model", parts: [{ text: answer }] },
      ]);
    } catch (err) {
      setConversation((prev) => prev.filter((item) => !item.loading));
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setConversation([]);
    setHistory([]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Intent chips */}
      <div className="flex flex-wrap gap-2">
        {intents.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setIntent(item.key)}
            className={`rounded-2xl border px-4 py-2 text-sm transition ${
              intent === item.key
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-bg text-text-dim hover:border-brand/50 hover:text-text"
            }`}
          >
            {item.emoji} {item.label}
          </button>
        ))}
      </div>

      {/* Conversation history */}
      {conversation.length > 0 && (
        <div className="max-h-[500px] space-y-3 overflow-y-auto rounded-2xl border border-line bg-bg p-4">
          {conversation.map((item, idx) => (
            <div
              key={idx}
              className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  item.role === "user"
                    ? "bg-brand/10 text-text border border-brand/20"
                    : "bg-bg-soft text-text border border-line"
                }`}
              >
                {item.loading ? (
                  <span className="flex items-center gap-2 text-text-dim">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:300ms]" />
                    </span>
                    AI Coach sedang mengetik...
                  </span>
                ) : (
                  <>
                    {item.role === "assistant" && (
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-brand">
                        AI Coach
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{item.text}</p>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Input area */}
      <div className="rounded-2xl border border-line bg-bg-soft p-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Ceritakan tantanganmu hari ini... (Ctrl+Enter untuk kirim)"
          disabled={loading}
          className="w-full resize-none rounded-xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSend()}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Mengirim..." : conversation.length === 0 ? "Mulai Sesi" : "Kirim"}
          </button>
          {conversation.length === 0 && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSend(intents.find((i) => i.key === intent)?.prompt)}
              className="rounded-xl border border-line px-5 py-2.5 text-sm text-text-dim transition hover:border-brand hover:text-text disabled:opacity-50"
            >
              Mulai topik: {intents.find((i) => i.key === intent)?.label}
            </button>
          )}
          {conversation.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="ml-auto rounded-xl border border-line px-3 py-2.5 text-xs text-text-dim transition hover:border-danger/40 hover:text-danger"
            >
              Reset sesi
            </button>
          )}
          <p className="ml-auto text-xs text-text-dim">
            {process.env.NEXT_PUBLIC_APP_ENV !== "production"
              ? "Gemini 1.5 Flash (fallback jika tidak ada API key)"
              : "Powered by Gemini"}
          </p>
        </div>
      </div>
    </div>
  );
}
