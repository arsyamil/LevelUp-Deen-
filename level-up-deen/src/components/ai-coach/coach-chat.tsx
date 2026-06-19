"use client";

import { useEffect, useRef, useState } from "react";
import { CoachIntent, CoachMessage } from "@/lib/ai-coach";

// Simple Inline SVG Icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const intents: { key: CoachIntent; label: string; prompt: string }[] = [
  { key: "burnout", label: "Cara atasi burnout", prompt: "Aku merasa agak lelah dan burnout akhir-akhir ini. Punya saran biar semangat lagi?" },
  { key: "time_management", label: "Manajemen Waktu", prompt: "Gimana ya caranya biar aku bisa ngatur waktu lebih baik setiap hari?" },
  { key: "consistency_drop", label: "Jaga Konsistensi", prompt: "Akhir-akhir ini kebiasaan baikku lagi drop nih. Tolong bantu dong." },
  { key: "finance_discipline", label: "Disiplin Finansial", prompt: "Aku lagi susah banget disiplin soal uang. Punya tips praktis?" },
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

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
    if (e.key === "Enter" && !e.shiftKey) {
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
    <div className="flex flex-col h-full relative">
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto pb-44 no-scrollbar">
        {conversation.length === 0 ? (
          <section className="flex flex-col items-center text-center py-12 px-4">
            <div className="w-20 h-20 bg-brand-soft rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20">
              <div className="text-brand">
                <SparklesIcon />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-text mb-2 tracking-wide">Coach Deen</h2>
            <p className="text-sm text-text-dim max-w-sm leading-relaxed">
              Pendamping AI personal Anda untuk mengubah tugas harian menjadi pencapaian legendaris.
            </p>
          </section>
        ) : (
          <div className="flex flex-col gap-6 py-6" id="chat-flow">
            {conversation.map((item, idx) => (
              <div key={idx} className={`flex flex-col gap-2 max-w-[85%] md:max-w-[70%] ${item.role === "user" ? "self-end" : "self-start"}`}>
                {item.role === "assistant" ? (
                  <div className="glass-bubble bg-bg-soft/60 border border-line rounded-2xl rounded-tl-none p-4 shadow-sm">
                    {item.loading ? (
                      <div className="flex gap-1 py-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">{item.text}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-brand text-black rounded-2xl rounded-tr-none p-4 shadow-md shadow-brand/20">
                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{item.text}</p>
                  </div>
                )}
                <span className={`text-[10px] text-text-dim px-1 ${item.role === "user" ? "text-right" : "text-left"}`}>
                  {item.role === "user" ? "You" : "Coach"}
                </span>
              </div>
            ))}
            {error && (
              <div className="self-center bg-danger/10 border border-danger/20 text-danger rounded-xl p-3 text-xs">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Interaction Hub (Fixed/Sticky Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        <div className="bg-gradient-to-t from-bg via-bg/90 to-transparent pt-10 pb-4">
          
          {/* Suggestion Chips */}
          <div className="mb-3 px-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
              {intents.map((intentItem) => (
                <button
                  key={intentItem.key}
                  onClick={() => {
                    setIntent(intentItem.key);
                    handleSend(intentItem.prompt);
                  }}
                  className="flex-none whitespace-nowrap px-4 py-2 bg-bg-soft border border-line rounded-full text-xs font-medium text-text-dim hover:bg-brand-soft hover:text-brand hover:border-brand/40 transition-all active:scale-95"
                >
                  {intentItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-bg/90 backdrop-blur-2xl border-t border-line/50 px-2 sm:px-4 py-3">
            <div className="max-w-3xl mx-auto flex items-end gap-3 bg-bg-soft border border-line rounded-2xl p-2 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10 transition-all duration-300 shadow-sm relative overflow-hidden group">
              {/* Glowing background effect for input */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand/10 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              
              <button 
                onClick={handleReset}
                title="Reset Sesi"
                className="p-2 text-text-dim hover:text-danger transition-colors self-center shrink-0"
              >
                <TrashIcon />
              </button>
              
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent border-none focus:ring-0 py-2 text-sm text-text resize-none max-h-32 scrollbar-hide outline-none"
                placeholder="Tanya apapun ke coach..."
              />
              
              <button 
                disabled={loading || !message.trim()}
                onClick={() => handleSend()}
                className="w-10 h-10 bg-brand text-black rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
