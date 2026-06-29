"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Service, SafeUser } from "@/lib/types";
import type { DayOption } from "@/lib/slots";
import { formatMoney, formatTime, formatDateLong } from "@/lib/slots";

type Step = 1 | 2 | 3 | 4 | 5;

export function BookingFlow({
  services,
  days,
  initialService,
  user,
}: {
  services: Service[];
  days: DayOption[];
  initialService: string | null;
  user: SafeUser | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialService ? 2 : 1);
  const [serviceId, setServiceId] = useState<string | null>(initialService);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find((s) => s.id === serviceId) ?? null;

  async function pickDate(d: string) {
    setDate(d);
    setTime(null);
    setLoadingSlots(true);
    const res = await fetch(`/api/slots?date=${d}`);
    const json = await res.json();
    setSlots(json.slots ?? []);
    setLoadingSlots(false);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        date,
        time,
        notes,
        name,
        email,
        password,
        phone,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    setStep(5);
    router.refresh();
  }

  return (
    <div className="mt-8">
      {step < 5 && <Steps step={step} />}

      {/* Step 1 — service */}
      {step === 1 && (
        <Card title="Choose a service">
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServiceId(s.id);
                  setStep(2);
                }}
                className="text-left rounded-xl ring-1 ring-brand-100 hover:ring-brand-400 hover:bg-brand-50 p-4 transition"
              >
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-brand-900">{s.name}</span>
                  <span className="font-bold text-brand-700">{formatMoney(s.priceCents)}</span>
                </div>
                <p className="mt-1 text-sm text-brand-800/70">{s.description}</p>
                <span className="mt-2 inline-block text-xs text-brand-600/60">
                  {s.durationMin} min
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 2 — date & time */}
      {step === 2 && service && (
        <Card title="Pick a date & time" onBack={() => setStep(1)}>
          <p className="text-sm text-brand-700 mb-4">
            {service.name} · {formatMoney(service.priceCents)} · {service.durationMin} min
          </p>
          <p className="text-sm font-medium text-brand-800 mb-2">Date</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => (
              <button
                key={d.date}
                onClick={() => pickDate(d.date)}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm ring-1 ${
                  date === d.date
                    ? "bg-brand-600 text-white ring-brand-600"
                    : "bg-white ring-brand-100 text-brand-800 hover:bg-brand-50"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {date && (
            <>
              <p className="mt-5 text-sm font-medium text-brand-800 mb-2">Time</p>
              {loadingSlots ? (
                <p className="text-sm text-brand-600/70">Loading…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-brand-600/70">
                  No open slots that day — try another date.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`px-3 py-2 rounded-lg text-sm ring-1 ${
                        time === t
                          ? "bg-brand-600 text-white ring-brand-600"
                          : "bg-white ring-brand-100 text-brand-800 hover:bg-brand-50"
                      }`}
                    >
                      {formatTime(t)}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-6 flex justify-end">
            <button
              disabled={!date || !time}
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-lg bg-brand-600 enabled:hover:bg-brand-700 text-white font-medium disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </Card>
      )}

      {/* Step 3 — details */}
      {step === 3 && service && (
        <Card title="Your details" onBack={() => setStep(2)}>
          {user ? (
            <p className="text-sm text-brand-700 mb-4">
              Booking as <strong>{user.name}</strong> ({user.email}).
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" value={name} onChange={setName} />
              <Field label="Email" value={email} onChange={setEmail} type="email" />
              <Field label="Phone (optional)" value={phone} onChange={setPhone} />
              <Field
                label="Create a password"
                value={password}
                onChange={setPassword}
                type="password"
                hint="So you can access your patient portal."
              />
            </div>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium text-brand-800 mb-1">
              What would you like help with? (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
              placeholder="Goals, conditions, allergies, anything I should know…"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              disabled={!user && (!name || !email || !password)}
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-lg bg-brand-600 enabled:hover:bg-brand-700 text-white font-medium disabled:opacity-40"
            >
              Review booking
            </button>
          </div>
        </Card>
      )}

      {/* Step 4 — review & confirm */}
      {step === 4 && service && (
        <Card title="Review & confirm" onBack={() => setStep(3)}>
          <Summary service={service} date={date!} time={time!} />
          {service.priceCents > 0 && (
            <p className="mt-3 text-sm text-brand-700 bg-brand-50 ring-1 ring-brand-100 rounded-lg px-3 py-2">
              Payment is collected offline — the nutritionist will share payment details after
              you book (or settle it on your call).
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 ring-1 ring-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={submit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold disabled:opacity-50"
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </Card>
      )}

      {/* Step 5 — confirmation */}
      {step === 5 && service && (
        <div className="rounded-2xl bg-white ring-1 ring-brand-100 p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-brand-100 grid place-items-center text-3xl">
            ✅
          </div>
          <h2 className="mt-4 text-2xl font-bold text-brand-900">You&apos;re booked!</h2>
          <p className="mt-2 text-brand-800/70">
            {service.name} on <strong>{formatDateLong(date!)}</strong> at{" "}
            <strong>{formatTime(time!)}</strong>.
          </p>
          <p className="mt-1 text-sm text-brand-600/70">
            It&apos;s saved to your portal{(email || user?.email) ? ` (${email || user?.email})` : ""}.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium"
            >
              Go to my portal
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg bg-white ring-1 ring-brand-200 text-brand-800 font-medium hover:bg-brand-50"
            >
              Back home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const labels = ["Service", "Date & time", "Details", "Confirm"];
  return (
    <div className="flex items-center gap-2 mb-6">
      {labels.map((l, i) => {
        const n = (i + 1) as Step;
        const done = step > n;
        const active = step === n;
        return (
          <div key={l} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full grid place-items-center text-xs font-semibold ${
                active
                  ? "bg-brand-600 text-white"
                  : done
                    ? "bg-brand-200 text-brand-800"
                    : "bg-white ring-1 ring-brand-100 text-brand-500"
              }`}
            >
              {done ? "✓" : n}
            </div>
            <span className={`text-xs ${active ? "text-brand-900 font-medium" : "text-brand-500"}`}>
              {l}
            </span>
            {i < labels.length - 1 && <span className="w-4 h-px bg-brand-200" />}
          </div>
        );
      })}
    </div>
  );
}

function Card({
  title,
  children,
  onBack,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-brand-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand-900">{title}</h2>
        {onBack && (
          <button onClick={onBack} className="text-sm text-brand-600 hover:underline">
            ← Back
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-800 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
      />
      {hint && <p className="mt-1 text-xs text-brand-600/60">{hint}</p>}
    </div>
  );
}

function Summary({ service, date, time }: { service: Service; date: string; time: string }) {
  return (
    <div className="rounded-xl bg-brand-50 ring-1 ring-brand-100 p-4 text-sm">
      <Row label="Service" value={service.name} />
      <Row label="When" value={`${formatDateLong(date)} · ${formatTime(time)}`} />
      <Row label="Duration" value={`${service.durationMin} min`} />
      <div className="mt-2 pt-2 border-t border-brand-200 flex justify-between font-semibold text-brand-900">
        <span>Total</span>
        <span>{formatMoney(service.priceCents)}</span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-brand-600/70">{label}</span>
      <span className="text-brand-900 font-medium">{value}</span>
    </div>
  );
}
