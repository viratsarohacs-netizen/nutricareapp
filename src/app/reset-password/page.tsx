"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  if (!token) {
    return (
      <p className="text-brand-800/80">
        This page needs a reset link from your email.{" "}
        <Link href="/forgot-password" className="text-brand-600 font-medium hover:underline">
          Request one here
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <div>
        <p className="text-brand-800">✅ Password updated! Taking you to login…</p>
        <Link href="/login" className="mt-4 inline-block text-sm text-brand-600 font-medium hover:underline">
          Go to login now →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-800 mb-1">New password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
        />
        <p className="mt-1 text-xs text-brand-600/60">At least 8 characters.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-800 mb-1">Confirm password</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 ring-1 ring-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="w-full px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold disabled:opacity-50"
      >
        {busy ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl bg-white ring-1 ring-brand-100 p-8">
        <h1 className="text-2xl font-bold text-brand-900 mb-4">Choose a new password</h1>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
