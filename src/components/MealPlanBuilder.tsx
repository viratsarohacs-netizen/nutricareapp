"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MealDay, MealPlan, MealType } from "@/lib/types";
import { MEAL_TEMPLATES } from "@/lib/mealTemplates";

interface LibraryMeal {
  id: string;
  category: MealType;
  text: string;
}

const MEAL_KEYS = ["breakfast", "lunch", "snack", "dinner"] as const;
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptyDay = (i: number): MealDay => ({
  day: i < 7 ? WEEKDAYS[i] : `Day ${i + 1}`,
  meals: { breakfast: "", lunch: "", snack: "", dinner: "" },
});

const cloneDays = (days: MealDay[]): MealDay[] =>
  days.map((d) => ({ day: d.day, meals: { ...d.meals } }));

export function MealPlanBuilder({
  patientId,
  lastPlan,
}: {
  patientId: string;
  lastPlan?: MealPlan | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState<MealDay[]>([emptyDay(0)]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // meal library
  const [library, setLibrary] = useState<LibraryMeal[]>([]);
  const [picker, setPicker] = useState<{ di: number; key: MealType } | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/meal-library")
      .then((r) => r.json())
      .then((j) => setLibrary(j.meals ?? []))
      .catch(() => {});
  }, [open]);

  function setMeal(di: number, key: MealType, v: string) {
    setDays((ds) => ds.map((d, i) => (i === di ? { ...d, meals: { ...d.meals, [key]: v } } : d)));
  }
  function setDayName(di: number, v: string) {
    setDays((ds) => ds.map((d, i) => (i === di ? { ...d, day: v } : d)));
  }

  // ── quick-start actions ────────────────────────────────────────────────────
  function loadTemplate(id: string) {
    const t = MEAL_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setTitle(t.name);
    setNotes(t.notes);
    setDays(cloneDays(t.days));
    setError(null);
  }
  function loadLastPlan() {
    if (!lastPlan) return;
    setTitle(`${lastPlan.title} (updated)`);
    setNotes(lastPlan.notes ?? "");
    setDays(cloneDays(lastPlan.days));
  }
  function copyPrevDay(di: number) {
    if (di === 0) return;
    setDays((ds) =>
      ds.map((d, i) => (i === di ? { ...d, meals: { ...ds[di - 1].meals } } : d))
    );
  }
  function applyDay1ToAll() {
    setDays((ds) => ds.map((d, i) => (i === 0 ? d : { ...d, meals: { ...ds[0].meals } })));
  }
  function addDays(n: number) {
    setDays((ds) => [...ds, ...Array.from({ length: n }, (_, i) => emptyDay(ds.length + i))]);
  }

  // ── library actions ────────────────────────────────────────────────────────
  function pickFromLibrary(text: string) {
    if (!picker) return;
    const current = days[picker.di]?.meals[picker.key] ?? "";
    setMeal(picker.di, picker.key, current ? `${current} + ${text}` : text);
    setPicker(null);
  }
  async function saveToLibrary(category: MealType, text: string) {
    const res = await fetch("/api/meal-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, text }),
    });
    if (res.ok) {
      const j = await res.json();
      setLibrary((l) => [...l, j.meal]);
    }
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
      {/* Quick start */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) loadTemplate(e.target.value);
            e.target.value = "";
          }}
          className="rounded-lg ring-1 ring-brand-200 bg-white px-2.5 py-2 text-xs font-medium text-brand-800"
        >
          <option value="" disabled>
            ⚡ Start from template…
          </option>
          {MEAL_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {lastPlan && (
          <button
            type="button"
            onClick={loadLastPlan}
            className="rounded-lg ring-1 ring-brand-200 bg-white px-2.5 py-2 text-xs font-medium text-brand-800 hover:bg-brand-50"
          >
            📋 Copy last plan
          </button>
        )}
        <button
          type="button"
          onClick={() => addDays(7 - (days.length % 7 || 7) || 7)}
          className="rounded-lg ring-1 ring-brand-200 bg-white px-2.5 py-2 text-xs font-medium text-brand-800 hover:bg-brand-50"
        >
          + Full week
        </button>
        {days.length > 1 && (
          <button
            type="button"
            onClick={applyDay1ToAll}
            className="rounded-lg ring-1 ring-brand-200 bg-white px-2.5 py-2 text-xs font-medium text-brand-800 hover:bg-brand-50"
            title="Copy Day 1's meals into every other day"
          >
            ⇊ Apply Day 1 to all
          </button>
        )}
      </div>

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
            <div className="flex items-center gap-3">
              {di > 0 && (
                <button
                  type="button"
                  onClick={() => copyPrevDay(di)}
                  className="text-xs text-brand-600 hover:underline"
                  title="Copy previous day's meals"
                >
                  ⧉ copy prev
                </button>
              )}
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
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MEAL_KEYS.map((k) => {
              const isPicking = picker?.di === di && picker?.key === k;
              const suggestions = library.filter((m) => m.category === k);
              const val = d.meals[k] ?? "";
              const inLibrary = suggestions.some((m) => m.text === val.trim());
              return (
                <div key={k}>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-semibold text-brand-600 uppercase tracking-wide">
                      {k}
                    </label>
                    <div className="flex gap-2">
                      {val.trim() && !inLibrary && (
                        <button
                          type="button"
                          onClick={() => void saveToLibrary(k, val.trim())}
                          className="text-[10px] text-brand-500 hover:underline"
                          title="Save this meal to your library"
                        >
                          + save
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPicker(isPicking ? null : { di, key: k })}
                        className={`text-[10px] hover:underline ${
                          isPicking ? "text-brand-800 font-semibold" : "text-brand-500"
                        }`}
                      >
                        {isPicking ? "close" : "▾ pick"}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={val}
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
                  {isPicking && (
                    <div className="mt-1 flex flex-wrap gap-1 max-h-28 overflow-y-auto rounded-md bg-brand-50 ring-1 ring-brand-100 p-1.5">
                      {suggestions.length === 0 && (
                        <span className="text-[10px] text-brand-600/60 px-1">
                          No saved {k} meals yet — type one and hit “+ save”.
                        </span>
                      )}
                      {suggestions.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => pickFromLibrary(m.text)}
                          className="px-2 py-1 rounded-full bg-white ring-1 ring-brand-200 text-[10px] text-brand-800 hover:bg-brand-100"
                        >
                          {m.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => addDays(1)}
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
