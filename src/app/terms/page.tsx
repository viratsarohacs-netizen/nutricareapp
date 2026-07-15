import { LegalPage } from "@/components/LegalPage";
import { practice } from "@/lib/config";

export const metadata = { title: `Terms of Service — ${practice.name}` };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 2026">
      <p>
        By using this website and booking consultations with {practice.name} you agree to
        these terms. Please also read the{" "}
        <a href="/disclaimer" className="text-brand-600 underline">Medical Disclaimer</a> and{" "}
        <a href="/privacy" className="text-brand-600 underline">Privacy Policy</a>.
      </p>

      <h2>The service</h2>
      <ul>
        <li>This platform lets you book online nutrition consultations, receive personalised meal plans and documents, track your progress, and message the dietitian.</li>
        <li>Consultations are professional dietary guidance — they are <strong>not</strong> emergency medical care and do not replace your physician.</li>
      </ul>

      <h2>Bookings, payment & cancellation</h2>
      <ul>
        <li>Session prices are displayed at booking. Payment is currently collected offline (bank transfer / UPI / as agreed) — details are shared after booking.</li>
        <li>You may reschedule or cancel from your portal. Please give at least 12 hours&apos; notice so the slot can be offered to someone else.</li>
        <li>Repeated no-shows may lead to booking restrictions.</li>
      </ul>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Provide accurate health information — plans are built on what you share.</li>
        <li>Keep your login credentials confidential; you are responsible for activity on your account.</li>
        <li>Inform your doctor about dietary changes if you are under medical treatment.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Meal plans and documents shared with you are for your personal use only and may not be
        redistributed or resold.
      </p>

      <h2>Liability</h2>
      <p>
        The service is provided with professional care but without guarantee of specific health
        outcomes, which depend on many individual factors. To the maximum extent permitted by
        law, liability is limited to the fees paid for the consultation concerned.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated from time to time; continued use after an update constitutes
        acceptance. Material changes will be highlighted on this page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${practice.email}`} className="text-brand-600 underline">{practice.email}</a>
      </p>
    </LegalPage>
  );
}
