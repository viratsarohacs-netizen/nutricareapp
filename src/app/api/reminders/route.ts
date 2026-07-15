import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAppointmentReminder, sendAdminDailySummary, isTestEmail } from "@/lib/email";
import type { Booking } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Daily Vercel cron (vercel.json) — runs 02:30 UTC = 08:00 IST.
// Emails every patient with a confirmed session TOMORROW (IST) + a schedule
// summary to the dietitian. Idempotent per day (one cron firing).
export async function GET(req: Request) {
  // If CRON_SECRET is configured, only Vercel Cron may call this.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // "tomorrow" in IST (UTC+5:30)
  const nowIst = new Date(Date.now() + 5.5 * 60 * 60_000);
  nowIst.setUTCDate(nowIst.getUTCDate() + 1);
  const tomorrow = nowIst.toISOString().slice(0, 10);

  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("date", tomorrow)
    .eq("status", "confirmed")
    .order("time");

  const bookings: Booking[] = (data ?? []).map((r: any) => ({
    id: r.id,
    patientId: r.patient_id,
    patientName: r.patient_name,
    patientEmail: r.patient_email,
    serviceId: r.service_id,
    serviceName: r.service_name,
    date: r.date,
    time: r.time,
    status: r.status,
    payment: r.payment,
    amountCents: r.amount_cents,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  }));

  const real = bookings.filter((b) => !isTestEmail(b.patientEmail));
  for (const b of real) await sendAppointmentReminder(b);
  await sendAdminDailySummary(real);

  return NextResponse.json({ ok: true, date: tomorrow, reminders: real.length });
}
