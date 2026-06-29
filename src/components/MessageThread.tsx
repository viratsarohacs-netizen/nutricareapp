"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Message } from "@/lib/types";

export function MessageThread({
  messages,
  patientId,
  asAdmin,
}: {
  messages: Message[];
  patientId: string;
  asAdmin?: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, patientId }),
    });
    setText("");
    setBusy(false);
    router.refresh();
  }

  const mineSender = asAdmin ? "nutritionist" : "patient";

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-3 overflow-y-auto max-h-80 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-brand-600/60">No messages yet. Say hello 👋</p>
        )}
        {messages.map((m) => {
          const mine = m.sender === mineSender;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? "bg-brand-600 text-white rounded-br-sm"
                    : "bg-brand-50 text-brand-900 ring-1 ring-brand-100 rounded-bl-sm"
                }`}
              >
                {!mine && (
                  <p className="text-[10px] uppercase tracking-wide opacity-60 mb-0.5">
                    {m.sender === "nutritionist" ? "Nutritionist" : "Patient"}
                  </p>
                )}
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
        />
        <button
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
