"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/types";

export function ReviewForm({ existing }: { existing: Review | null }) {
  const router = useRouter();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existing) {
    return (
      <div className="text-sm">
        <div className="text-brand-400">{"★".repeat(existing.rating)}{"☆".repeat(5 - existing.rating)}</div>
        <p className="mt-1 text-brand-800/80 italic">“{existing.text}”</p>
        <p className="mt-2 text-xs text-brand-600/70">
          {existing.approved
            ? "✅ Published on the website — thank you!"
            : "⏳ Submitted — will appear on the website once approved."}
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || !text.trim()) {
      setError("Pick a star rating and write a line or two.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, text }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? "Could not submit.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl transition ${n <= rating ? "text-amber-400" : "text-brand-200"}`}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="How has your experience been?"
        className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        disabled={busy}
        className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
