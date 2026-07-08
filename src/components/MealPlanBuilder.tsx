"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MealDay } from "@/lib/types";

const emptyDay = (i: number): MealDay => ({
  day: `Day ${i + 1}`,
  meals: { breakfast: "", lunch: "", snack: "", dinner: "" },
});

export function MealPlanBuilder({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState<MealDay[]>([emptyDay(0)]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setMeal(di: number, key: keyof MealDay["meals"], v: string) {
    setDays((ds) => ds.map((d, i) => (i === di ? { ...d, meals: { ...d.meals, [key]: v } } : d)));
  }
  function setDayName(di: number, v: string) {
    setDays((ds) => ds.map((d, i) => (i === di ? { ...d, day: v } : d)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the plan a title.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, title, days, notes }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? "Could not save.");
      return;
    }
    setTitle("");
    setNotes("");
    setDays([emptyDay(0)]);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
      >
        + Create meal plan
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl ring-1 ring-brand-200 p-3 bg-cream/60">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Plan title — e.g. Week 1: Low-GI Kickstart"
        className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-400 outline-none"
      />

      {days.map((d, di) => (
        <div key={di} className="rounded-lg bg-white ring-1 ring-brand-100 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <input
              value={d.day}
              onChange={(e) => setDayName(di, e.target.value)}
              className="text-sm font-semibold text-brand-800 bg-transparent border-b border-dashed border-brand-200 focus:border-brand-400 outline-none w-40"
            />
            {days.length > 1 && (
              <button
                type="button"
                onClick={() => setDays((ds) => ds.filter((_, i) => i !== di))}
                className="text-xs text-red-500 hover:underline"
              >
                remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["breakfast", "lunch", "snack", "dinner"] as const).map((k) => (
              <div key={k}>
                <label className="block text-[10px] font-semibold text-brand-600 uppercase tracking-wide mb-0.5">
                  {k}
                </label>
                <textarea
                  value={d.meals[k] ?? ""}
                  onChange={(e) => setMeal(di, k, e.target.value)}
                  rows={2}
                  className="w-full rounded-md ring-1 ring-brand-100 bg-white px-2 py-1.5 text-xs focus:ring-2 focus:ring-brand-400 outline-none"
                  placeholder={
                    k === "breakfast"
                      ? "Veg poha + green tea"
                      : k === "lunch"
                        ? "2 roti + dal + salad"
                        : k === "snack"
                          ? "Fruit / roasted chana"
                          : "Khichdi + curd"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDays((ds) => [...ds, emptyDay(ds.length)])}
          className="text-xs text-brand-600 hover:underline"
        >
          + Add day
        </button>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="General notes — hydration, timing, what to avoid…"
        className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-brand-400 outline-none"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-50"
        >
          {busy ? "Saving…" : "Share plan with patient"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg ring-1 ring-brand-200 text-brand-700 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
