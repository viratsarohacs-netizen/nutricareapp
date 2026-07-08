"use client";

import { useState } from "react";
import Link from "next/link";

export function BmiCalculator() {
  const [h, setH] = useState("");
  const [w, setW] = useState("");

  const height = Number(h);
  const weight = Number(w);
  const bmi = height > 0 && weight > 0 ? weight / (height / 100) ** 2 : null;

  let cat = "";
  let tone = "text-brand-700";
  if (bmi != null) {
    if (bmi < 18.5) {
      cat = "Underweight";
      tone = "text-amber-600";
    } else if (bmi < 25) {
      cat = "Healthy range";
      tone = "text-green-600";
    } else if (bmi < 30) {
      cat = "Overweight";
      tone = "text-amber-600";
    } else {
      cat = "Obese";
      tone = "text-red-600";
    }
  }

  return (
    <div className="rounded-3xl bg-white ring-1 ring-brand-100 p-6 sm:p-8 shadow-sm">
      <h3 className="text-xl font-bold text-brand-900">Free BMI check</h3>
      <p className="mt-1 text-sm text-brand-800/70">
        A quick starting point — I&apos;ll build your real plan around much more than this.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-brand-700 mb-1">Height (cm)</label>
          <input
            type="number"
            value={h}
            onChange={(e) => setH(e.target.value)}
            placeholder="165"
            className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            value={w}
            onChange={(e) => setW(e.target.value)}
            placeholder="72"
            className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-brand-50 ring-1 ring-brand-100 p-5 text-center">
        {bmi != null ? (
          <>
            <div className="text-4xl font-bold text-brand-800">{bmi.toFixed(1)}</div>
            <div className={`mt-1 text-sm font-semibold ${tone}`}>{cat}</div>
          </>
        ) : (
          <div className="text-sm text-brand-600/60 py-3">Enter your height & weight</div>
        )}
      </div>

      <Link
        href="/book"
        className="mt-5 block text-center px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold"
      >
        Get a personalised plan →
      </Link>
    </div>
  );
}
