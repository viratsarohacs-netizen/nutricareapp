"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DayOption } from "@/lib/slots";
import { formatTime } from "@/lib/slots";

export function RescheduleControls({
  bookingId,
  days,
}: {
  bookingId: string;
  days: DayOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [time, setTime] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pickDate(d: string) {
    setDate(d);
    setTime(null);
    const res = await fetch(`/api/slots?date=${d}`);
    const j = await res.json();
    setSlots(j.slots ?? []);
  }

  async function confirmReschedule() {
    if (!date || !time) return;
    setBusy(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time }),
    });
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  async function cancel() {
    if (!confirm("Cancel this appointment?")) return;
    setBusy(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-2">
      <div className="flex gap-3 text-xs">
        <button onClick={() => setOpen((o) => !o)} className="text-brand-600 hover:underline">
          {open ? "Close" : "Reschedule"}
        </button>
        <button onClick={cancel} disabled={busy} className="text-red-600 hover:underline disabled:opacity-50">
          Cancel
        </button>
      </div>

      {open && (
        <div className="mt-2 rounded-lg bg-white ring-1 ring-brand-100 p-3">
          <p className="text-[11px] font-medium text-brand-700 mb-1">New date</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {days.map((d) => (
              <button
                key={d.date}
                onClick={() => pickDate(d.date)}
                className={`shrink-0 px-2 py-1 rounded text-[11px] ring-1 ${
                  date === d.date
                    ? "bg-brand-600 text-white ring-brand-600"
                    : "bg-white ring-brand-100 text-brand-800"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {date && (
            <>
              <p className="text-[11px] font-medium text-brand-700 mt-2 mb-1">New time</p>
              {slots.length === 0 ? (
                <p className="text-[11px] text-brand-600/60">No open slots — try another day.</p>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTime(s)}
                      className={`px-1.5 py-1 rounded text-[11px] ring-1 ${
                        time === s
                          ? "bg-brand-600 text-white ring-brand-600"
                          : "bg-white ring-brand-100 text-brand-800"
                      }`}
                    >
                      {formatTime(s)}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <button
            onClick={confirmReschedule}
            disabled={!date || !time || busy}
            className="mt-3 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium disabled:opacity-40"
          >
            {busy ? "Saving…" : "Confirm reschedule"}
          </button>
        </div>
      )}
    </div>
  );
}
