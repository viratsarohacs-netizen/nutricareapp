"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isLogin ? { email, password } : { name, email, password, phone }
      ),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    router.push(json.role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl bg-white ring-1 ring-brand-100 p-8">
        <h1 className="text-2xl font-bold text-brand-900">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-brand-800/70">
          {isLogin
            ? "Log in to access your patient portal."
            : "Sign up to book and manage your consultations."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {!isLogin && (
            <Input label="Full name" value={name} onChange={setName} required />
          )}
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          {!isLogin && (
            <Input label="Phone (optional)" value={phone} onChange={setPhone} />
          )}
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
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
            {busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        {isLogin && (
          <p className="mt-3 text-sm text-center">
            <Link href="/forgot-password" className="text-brand-600 hover:underline">
              Forgot your password?
            </Link>
          </p>
        )}

        <p className="mt-4 text-sm text-center text-brand-800/70">
          {isLogin ? (
            <>
              New here?{" "}
              <Link href="/signup" className="text-brand-600 font-medium hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-brand-600 font-medium hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>

      {isLogin && (
        <div className="mt-4 rounded-xl bg-brand-50 ring-1 ring-brand-100 p-4 text-xs text-brand-700">
          <p className="font-semibold">Demo accounts</p>
          <p className="mt-1">Patient — patient@demo.com / demo123</p>
          <p>Nutritionist (admin) — anya@anyasharma.health / admin123</p>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-800 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
      />
    </div>
  );
}
