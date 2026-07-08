"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DailyHabit, FoodLog, MealType } from "@/lib/types";

const MEALS: { key: MealType; label: string; icon: string }[] = [
  { key: "breakfast", label: "Breakfast", icon: "🌅" },
  { key: "lunch", label: "Lunch", icon: "☀️" },
  { key: "snack", label: "Snack", icon: "🍎" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
];

export function DailyTracker({
  todayHabit,
  recentLogs,
}: {
  todayHabit: DailyHabit | null;
  recentLogs: FoodLog[];
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [water, setWater] = useState(todayHabit?.waterGlasses ?? 0);
  const [sleep, setSleep] = useState(todayHabit?.sleepHours?.toString() ?? "");
  const [exercised, setExercised] = useState(todayHabit?.exercised ?? false);
  const [followed, setFollowed] = useState(todayHabit?.followedPlan ?? false);

  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [mealText, setMealText] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveHabit(patch: Record<string, unknown>) {
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, ...patch }),
    });
    router.refresh();
  }

  function bumpWater(delta: number) {
    const next = Math.max(0, Math.min(20, water + delta));
    setWater(next);
    void saveHabit({ waterGlasses: next });
  }

  async function logMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!mealText.trim()) return;
    setBusy(true);
    await fetch("/api/food-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, mealType, description: mealText }),
    });
    setMealText("");
    setBusy(false);
    router.refresh();
  }

  const todaysLogs = recentLogs.filter((l) => l.date === today);

  return (
    <div className="space-y-5">
      {/* Water */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-brand-800">💧 Water</p>
          <p className="text-xs text-brand-600/70">{water} / 8 glasses</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => bumpWater(-1)}
            className="w-8 h-8 rounded-lg ring-1 ring-brand-200 text-brand-700 hover:bg-brand-50 font-bold"
          >
            −
          </button>
          <div className="flex-1 flex gap-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className={`h-6 flex-1 rounded ${
                  i < water ? "bg-sky-400" : "bg-brand-100"
                } transition-colors`}
              />
            ))}
          </div>
          <button
            onClick={() => bumpWater(1)}
            className="w-8 h-8 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Habits */}
      <div className="grid grid-cols-3 gap-2">
        <label className="rounded-xl ring-1 ring-brand-100 p-2.5 text-center cursor-pointer hover:bg-brand-50">
          <input
            type="checkbox"
            checked={exercised}
            onChange={(e) => {
              setExercised(e.target.checked);
              void saveHabit({ exercised: e.target.checked });
            }}
            className="accent-brand-600"
          />
          <span className="block mt-1 text-[11px] font-medium text-brand-800">🏃 Exercised</span>
        </label>
        <label className="rounded-xl ring-1 ring-brand-100 p-2.5 text-center cursor-pointer hover:bg-brand-50">
          <input
            type="checkbox"
            checked={followed}
            onChange={(e) => {
              setFollowed(e.target.checked);
              void saveHabit({ followedPlan: e.target.checked });
            }}
            className="accent-brand-600"
          />
          <span className="block mt-1 text-[11px] font-medium text-brand-800">🥗 Followed plan</span>
        </label>
        <div className="rounded-xl ring-1 ring-brand-100 p-2.5 text-center">
          <input
            type="number"
            step="0.5"
            value={sleep}
            placeholder="7.5"
            onChange={(e) => setSleep(e.target.value)}
            onBlur={() => void saveHabit({ sleepHours: sleep })}
            className="w-12 text-center text-sm rounded ring-1 ring-brand-100 outline-none focus:ring-brand-400"
          />
          <span className="block mt-1 text-[11px] font-medium text-brand-800">😴 Sleep (h)</span>
        </div>
      </div>

      {/* Food journal */}
      <div>
        <p className="text-sm font-medium text-brand-800 mb-2">🍽️ Food journal — today</p>
        <form onSubmit={logMeal} className="flex gap-2">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="rounded-lg ring-1 ring-brand-200 bg-white px-2 py-2 text-xs capitalize"
          >
            {MEALS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
          <input
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            placeholder="What did you eat?"
            className="flex-1 rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
          />
          <button
            disabled={busy}
            className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-50"
          >
            Log
          </button>
        </form>

        {todaysLogs.length > 0 && (
          <ul className="mt-2 space-y-1">
            {todaysLogs.map((l) => {
              const meta = MEALS.find((m) => m.key === l.mealType);
              return (
                <li key={l.id} className="flex gap-2 text-sm text-brand-800/80">
                  <span className="shrink-0">{meta?.icon}</span>
                  <span className="font-medium text-brand-700 capitalize shrink-0">
                    {l.mealType}:
                  </span>
                  <span className="truncate">{l.description}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
