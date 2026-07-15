import { LegalPage } from "@/components/LegalPage";
import { practice } from "@/lib/config";

export const metadata = { title: `Privacy Policy — ${practice.name}` };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 2026">
      <p>
        This website (&quot;the Service&quot;) is operated by {practice.name},{" "}
        {practice.credential}. Your privacy — especially your health information — matters
        deeply to us. This policy explains what we collect, why, and your rights, in line with
        India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act).
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, email address, phone number, password (stored hashed — we can never see it).</li>
        <li><strong>Health data you choose to share:</strong> intake details (age, height, weight, goals, medical conditions, allergies), progress logs, food journal entries, and daily habit entries.</li>
        <li><strong>Consultation data:</strong> bookings, meal plans and documents shared with you, and messages between you and the dietitian.</li>
        <li><strong>Technical data:</strong> anonymised usage analytics (page views, device type). We do not use advertising trackers.</li>
      </ul>

      <h2>Why we collect it</h2>
      <ul>
        <li>To provide nutrition consultation services — this is the only purpose.</li>
        <li>To send you service emails (booking confirmations, reminders, shared plans).</li>
        <li>We <strong>never sell</strong> your data or share it with advertisers.</li>
      </ul>

      <h2>Who can see your data</h2>
      <ul>
        <li>Only you and the dietitian. Access controls are enforced at the database level — no patient can ever see another patient&apos;s data.</li>
        <li>Infrastructure providers process data on our behalf: Supabase (database hosting), Vercel (application hosting), and Google (email delivery). Each is bound by its own security and privacy commitments.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        Your data is retained while your account is active. You may request deletion of your
        account and all associated data at any time by emailing{" "}
        <a href={`mailto:${practice.email}`} className="text-brand-600 underline">{practice.email}</a>{" "}
        — we will complete deletion within 30 days.
      </p>

      <h2>Your rights (DPDP Act)</h2>
      <ul>
        <li>Access a copy of your personal data.</li>
        <li>Correct inaccurate data (most of it you can edit directly in your portal).</li>
        <li>Withdraw consent and request erasure.</li>
        <li>Raise a grievance — first with us at {practice.email}; unresolved grievances may be escalated to the Data Protection Board of India.</li>
      </ul>

      <h2>Security</h2>
      <p>
        Data is encrypted in transit (HTTPS) and at rest. Passwords are hashed. Row-level
        security ensures strict data isolation between patients. Payment card details are
        never collected by this website.
      </p>

      <h2>Contact</h2>
      <p>
        {practice.name} · <a href={`mailto:${practice.email}`} className="text-brand-600 underline">{practice.email}</a>
      </p>
    </LegalPage>
  );
}
