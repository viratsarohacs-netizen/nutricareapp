import nodemailer from "nodemailer";
import { practice } from "./config";
import type { Booking, MealPlan, DietDoc, Review } from "./types";
import { formatDateLong, formatTime, formatMoney } from "./slots";

// ─────────────────────────────────────────────────────────────────────────────
// Email notifications — Gmail SMTP via App Password.
// Env (in .env.local / Vercel): GMAIL_USER, GMAIL_APP_PASSWORD.
//
// Design rules:
//  • NEVER throw — an email failure must never break the API action itself.
//  • No-op when env is missing (local dev works without setup).
//  • Skip @nutricare-test.com recipients (smoke-test accounts).
// ─────────────────────────────────────────────────────────────────────────────

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const transporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      })
    : null;

// Smoke-test accounts — suppress ALL notifications they trigger (including
// admin alerts), so test runs never email anyone real.
export function isTestEmail(email: string | undefined | null): boolean {
  return !!email && email.endsWith("@nutricare-test.com");
}

function skip(to: string): boolean {
  return !transporter || !to || isTestEmail(to);
}

async function send(to: string, subject: string, bodyHtml: string): Promise<void> {
  if (skip(to)) return;
  try {
    await transporter!.sendMail({
      from: `"${practice.name}" <${GMAIL_USER}>`,
      to,
      subject,
      html: wrap(bodyHtml),
    });
  } catch (e) {
    console.error("[email] send failed:", e instanceof Error ? e.message : e);
  }
}

// Branded wrapper — inline styles only (email clients ignore stylesheets).
function wrap(inner: string): string {
  return `<!doctype html>
<body style="margin:0;padding:0;background:#f6f8f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #d6f2dd;">
        <tr>
          <td style="background:#1f7c4b;padding:18px 24px;">
            <span style="color:#ffffff;font-size:18px;font-weight:bold;">🌿 ${practice.name}</span><br/>
            <span style="color:#d6f2dd;font-size:12px;">${practice.credential}</span>
          </td>
        </tr>
        <tr><td style="padding:24px;color:#1d2a23;font-size:14px;line-height:1.6;">${inner}</td></tr>
        <tr>
          <td style="padding:16px 24px;background:#faf8f1;border-top:1px solid #d6f2dd;color:#6b7f72;font-size:11px;">
            ${practice.name} · ${practice.location}<br/>
            Questions? Just reply to this email or message me in your
            <a href="https://nutricare-ten.vercel.app/dashboard" style="color:#1f7c4b;">patient portal</a>.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>`;
}

const btn = (href: string, label: string) =>
  `<p style="margin:20px 0;"><a href="${href}" style="background:#1f7c4b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:bold;font-size:13px;">${label}</a></p>`;

const bookingTable = (b: Booking) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="background:#eefaf1;border-radius:8px;width:100%;margin:12px 0;">
  <tr><td style="padding:14px 16px;font-size:14px;color:#1d2a23;line-height:1.8;">
    <strong>${b.serviceName}</strong><br/>
    📅 ${formatDateLong(b.date)}<br/>
    🕐 ${formatTime(b.time)}<br/>
    💰 ${formatMoney(b.amountCents)}${b.amountCents > 0 ? " (payment details will be shared separately)" : ""}
  </td></tr>
</table>`;

const PORTAL = "https://nutricare-ten.vercel.app/dashboard";
const ADMIN_URL = "https://nutricare-ten.vercel.app/admin";

// ── Notification API (each is fire-safe) ─────────────────────────────────────

export async function notifyBookingConfirmed(b: Booking): Promise<void> {
  await Promise.all([
    send(
      b.patientEmail,
      `Booking confirmed — ${b.serviceName} on ${formatDateLong(b.date)}`,
      `<p>Hi ${b.patientName.split(" ")[0]},</p>
       <p>Your session is confirmed. Here are the details:</p>
       ${bookingTable(b)}
       <p>Please keep your recent reports handy and log your meals for a day or two before we meet — it helps me personalise your plan.</p>
       ${btn(PORTAL, "View in my portal")}
       <p>See you soon!<br/>${practice.name}</p>`
    ),
    send(
      practice.email,
      `🗓️ New booking: ${b.patientName} — ${b.serviceName} (${b.date} ${formatTime(b.time)})`,
      `<p><strong>${b.patientName}</strong> (${b.patientEmail}) booked:</p>
       ${bookingTable(b)}
       ${b.notes ? `<p><strong>Their note:</strong> “${b.notes}”</p>` : ""}
       ${btn(ADMIN_URL, "Open practice dashboard")}`
    ),
  ]);
}

export async function notifyBookingChanged(
  b: Booking,
  kind: "rescheduled" | "cancelled"
): Promise<void> {
  const verb = kind === "rescheduled" ? "rescheduled" : "cancelled";
  await Promise.all([
    send(
      b.patientEmail,
      `Booking ${verb} — ${b.serviceName}`,
      kind === "rescheduled"
        ? `<p>Hi ${b.patientName.split(" ")[0]},</p>
           <p>Your session has been rescheduled. New details:</p>
           ${bookingTable(b)}
           ${btn(PORTAL, "View in my portal")}`
        : `<p>Hi ${b.patientName.split(" ")[0]},</p>
           <p>Your <strong>${b.serviceName}</strong> on ${formatDateLong(b.date)} at ${formatTime(
             b.time
           )} has been cancelled.</p>
           <p>You can book a new slot anytime:</p>
           ${btn("https://nutricare-ten.vercel.app/book", "Book a new session")}`
    ),
    send(
      practice.email,
      `⚠️ Booking ${verb}: ${b.patientName} — ${b.serviceName} (${b.date} ${formatTime(b.time)})`,
      `<p><strong>${b.patientName}</strong> (${b.patientEmail}) ${verb} their booking:</p>
       ${bookingTable(b)}
       ${btn(ADMIN_URL, "Open practice dashboard")}`
    ),
  ]);
}

export async function notifyPlanShared(
  patientEmail: string,
  patientName: string,
  plan: MealPlan
): Promise<void> {
  await send(
    patientEmail,
    `Your new meal plan is ready — ${plan.title}`,
    `<p>Hi ${patientName.split(" ")[0]},</p>
     <p>${practice.name} has shared a new meal plan with you: <strong>${plan.title}</strong> (${plan.days.length} day${plan.days.length > 1 ? "s" : ""}).</p>
     ${plan.notes ? `<p><strong>Notes:</strong> ${plan.notes}</p>` : ""}
     ${btn(PORTAL, "View my meal plan")}`
  );
}

export async function notifyDocShared(
  patientEmail: string,
  patientName: string,
  doc: DietDoc
): Promise<void> {
  await send(
    patientEmail,
    `New ${doc.type} shared with you — ${doc.title}`,
    `<p>Hi ${patientName.split(" ")[0]},</p>
     <p>${practice.name} has shared a new ${doc.type} with you: <strong>${doc.title}</strong>.</p>
     ${btn(PORTAL, "View in my portal")}`
  );
}

export async function notifyReviewSubmitted(review: Review): Promise<void> {
  await send(
    practice.email,
    `⭐ New review from ${review.name} (${review.rating}/5)`,
    `<p><strong>${review.name}</strong> left a ${review.rating}-star review:</p>
     <p style="background:#eefaf1;border-radius:8px;padding:12px 16px;">“${review.text}”</p>
     <p>Approve it to publish it on your website.</p>
     ${btn(ADMIN_URL, "Review & approve")}`
  );
}
