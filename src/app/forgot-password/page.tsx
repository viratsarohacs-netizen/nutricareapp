"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong — try again.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl bg-white ring-1 ring-brand-100 p-8">
        <h1 className="text-2xl font-bold text-brand-900">Forgot your password?</h1>
        {sent ? (
          <div className="mt-4">
            <p className="text-brand-800/80">
              📬 If an account exists for <strong>{email}</strong>, a reset link is on its way.
              The link works for <strong>1 hour</strong>.
            </p>
            <p className="mt-3 text-sm text-brand-600/70">
              Don&apos;t see it? Check your spam folder.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm text-brand-600 font-medium hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-brand-800/70">
              Enter your email and we&apos;ll send you a link to reset it.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
              />
              {error && (
                <p className="text-sm text-red-600 bg-red-50 ring-1 ring-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                disabled={busy}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="mt-5 text-sm text-center text-brand-800/70">
              Remembered it?{" "}
              <Link href="/login" className="text-brand-600 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
