"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProgressLog } from "@/lib/types";
import { LineChart, type Point } from "@/components/LineChart";

function shortDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ProgressPanel({
  logs,
  goalWeightKg,
  startWeightKg,
  readOnly = false,
}: {
  logs: ProgressLog[];
  goalWeightKg?: number | null;
  startWeightKg?: number | null;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const points: Point[] = logs.map((l) => ({ label: shortDate(l.date), y: l.weightKg }));
  const current = logs.length ? logs[logs.length - 1].weightKg : null;
  const start = startWeightKg ?? (logs.length ? logs[0].weightKg : null);

  // progress toward goal
  let pct: number | null = null;
  let changed: number | null = null;
  if (current != null && start != null) changed = +(current - start).toFixed(1);
  if (goalWeightKg != null && start != null && current != null && start !== goalWeightKg) {
    pct = Math.max(0, Math.min(100, ((start - current) / (start - goalWeightKg)) * 100));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const w = Number(weight);
    if (!w) {
      setError("Enter your weight.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, weightKg: w, waistCm: waist, note }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? "Could not save.");
      return;
    }
    setWeight("");
    setWaist("");
    setNote("");
    router.refresh();
  }

  return (
    <div>
      {/* stat row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MiniStat label="Current" value={current != null ? `${current} kg` : "—"} />
        <MiniStat
          label="Change"
          value={changed != null ? `${changed > 0 ? "+" : ""}${changed} kg` : "—"}
          tone={changed != null && changed < 0 ? "good" : "plain"}
        />
        <MiniStat label="Goal" value={goalWeightKg != null ? `${goalWeightKg} kg` : "—"} />
      </div>

      {pct != null && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-brand-600/70 mb-1">
            <span>Progress to goal</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-brand-100 overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="rounded-xl ring-1 ring-brand-100 p-3 bg-white">
        <LineChart points={points} goal={goalWeightKg ?? undefined} />
      </div>

      {!readOnly && (
        <form onSubmit={submit} className="mt-4 grid sm:grid-cols-4 gap-2 items-end">
          <Field label="Date" type="date" value={date} onChange={setDate} />
          <Field label="Weight (kg)" type="number" value={weight} onChange={setWeight} placeholder="72.5" />
          <Field label="Waist (cm)" type="number" value={waist} onChange={setWaist} placeholder="opt." />
          <button
            disabled={busy}
            className="h-[38px] px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Saving…" : "Log entry"}
          </button>
          {error && <p className="sm:col-span-4 text-xs text-red-600">{error}</p>}
        </form>
      )}

      {logs.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-brand-600 cursor-pointer">View all entries</summary>
          <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto text-sm">
            {[...logs].reverse().map((l) => (
              <li key={l.id} className="flex justify-between text-brand-800/80">
                <span>{shortDate(l.date)}</span>
                <span>
                  {l.weightKg} kg{l.waistCm ? ` · ${l.waistCm} cm` : ""}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: string;
  tone?: "good" | "plain";
}) {
  return (
    <div className="rounded-xl bg-brand-50 ring-1 ring-brand-100 px-3 py-2 text-center">
      <div className={`text-lg font-bold ${tone === "good" ? "text-green-600" : "text-brand-800"}`}>
        {value}
      </div>
      <div className="text-[11px] text-brand-600/70">{label}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-brand-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        step="0.1"
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[38px] rounded-lg ring-1 ring-brand-200 bg-white px-3 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
      />
    </div>
  );
}
