import { LegalPage } from "@/components/LegalPage";
import { practice } from "@/lib/config";

export const metadata = { title: `Medical Disclaimer — ${practice.name}` };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Medical Disclaimer" updated="July 2026">
      <p>
        The information and guidance provided through this website and in consultations with{" "}
        {practice.name}, {practice.credential}, is intended for general dietary and lifestyle
        support.
      </p>

      <h2>Not a substitute for medical care</h2>
      <ul>
        <li>Nutrition consultation is <strong>not</strong> medical diagnosis or treatment, and does not replace advice from your physician or specialist.</li>
        <li>If you have a medical condition (diabetes, thyroid disorder, kidney disease, heart disease, are pregnant or breastfeeding, etc.), continue to follow your doctor&apos;s treatment and inform them about dietary changes.</li>
        <li><strong>Never stop or change prescribed medication</strong> based on dietary guidance alone.</li>
      </ul>

      <h2>Emergencies</h2>
      <p>
        This platform is not monitored for emergencies. If you experience a medical emergency,
        contact your local emergency services or go to the nearest hospital immediately.
      </p>

      <h2>Individual results</h2>
      <p>
        Outcomes vary from person to person and depend on adherence, medical history, and many
        individual factors. Testimonials on this site reflect individual experiences, not a
        guarantee of results.
      </p>

      <h2>Questions</h2>
      <p>
        <a href={`mailto:${practice.email}`} className="text-brand-600 underline">{practice.email}</a>
      </p>
    </LegalPage>
  );
}
