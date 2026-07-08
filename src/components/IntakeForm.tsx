"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Intake } from "@/lib/types";

const ACTIVITY = ["sedentary", "light", "moderate", "active"];
const DIET = ["veg", "non-veg", "vegan", "eggetarian"];

export function IntakeForm({ initial }: { initial: Intake | null }) {
  const router = useRouter();
  const filled = !!initial?.updatedAt;
  const [editing, setEditing] = useState(!filled);
  const [f, setF] = useState({
    age: initial?.age?.toString() ?? "",
    heightCm: initial?.heightCm?.toString() ?? "",
    startWeightKg: initial?.startWeightKg?.toString() ?? "",
    goalWeightKg: initial?.goalWeightKg?.toString() ?? "",
    activityLevel: initial?.activityLevel ?? "",
    dietPref: initial?.dietPref ?? "",
    conditions: initial?.conditions ?? "",
    allergies: initial?.allergies ?? "",
    goals: initial?.goals ?? "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setBusy(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="text-sm">
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
          <Row k="Age" v={f.age} />
          <Row k="Height" v={f.heightCm ? `${f.heightCm} cm` : ""} />
          <Row k="Start weight" v={f.startWeightKg ? `${f.startWeightKg} kg` : ""} />
          <Row k="Goal weight" v={f.goalWeightKg ? `${f.goalWeightKg} kg` : ""} />
          <Row k="Activity" v={f.activityLevel} />
          <Row k="Diet" v={f.dietPref} />
        </div>
        {f.conditions && <Row k="Conditions" v={f.conditions} block />}
        {f.allergies && <Row k="Allergies" v={f.allergies} block />}
        {f.goals && <Row k="Goals" v={f.goals} block />}
        <button
          onClick={() => setEditing(true)}
          className="mt-3 text-xs text-brand-600 hover:underline"
        >
          Edit my details
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <F label="Age" type="number" value={f.age} onChange={set("age")} />
        <F label="Height (cm)" type="number" value={f.heightCm} onChange={set("heightCm")} />
        <F label="Weight (kg)" type="number" value={f.startWeightKg} onChange={set("startWeightKg")} />
        <F label="Goal (kg)" type="number" value={f.goalWeightKg} onChange={set("goalWeightKg")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Activity level" value={f.activityLevel} onChange={set("activityLevel")} options={ACTIVITY} />
        <Select label="Diet preference" value={f.dietPref} onChange={set("dietPref")} options={DIET} />
      </div>
      <F label="Medical conditions (PCOS, thyroid, diabetes…)" value={f.conditions} onChange={set("conditions")} />
      <F label="Allergies / foods to avoid" value={f.allergies} onChange={set("allergies")} />
      <div>
        <label className="block text-xs font-medium text-brand-700 mb-1">Your goals</label>
        <textarea
          value={f.goals}
          onChange={(e) => set("goals")(e.target.value)}
          rows={2}
          className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
          placeholder="e.g. lose 8 kg, improve energy, manage sugar levels"
        />
      </div>
      <div className="flex gap-2">
        <button
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save details"}
        </button>
        {filled && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded-lg ring-1 ring-brand-200 text-brand-700 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Row({ k, v, block }: { k: string; v: string; block?: boolean }) {
  if (!v) return null;
  return (
    <div className={block ? "mt-1.5" : ""}>
      <span className="text-brand-600/70">{k}: </span>
      <span className="text-brand-900 font-medium capitalize">{v}</span>
    </div>
  );
}

function F({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-brand-700 mb-1">{label}</label>
      <input
        type={type}
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-brand-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none capitalize"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
