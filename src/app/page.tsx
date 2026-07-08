import Link from "next/link";
import { practice } from "@/lib/config";
import { listServices } from "@/lib/store";
import { formatMoney } from "@/lib/slots";
import { BmiCalculator } from "@/components/BmiCalculator";
import { Faq } from "@/components/Faq";

export default async function Home() {
  const services = await listServices();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-100/60 via-cream to-background" />
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200">
              ● Accepting new patients
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-brand-900 leading-[1.1]">
              {practice.tagline}
            </h1>
            <p className="mt-5 text-lg text-brand-800/80 max-w-prose">
              {practice.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/book"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm"
              >
                Book a consultation →
              </Link>
              <Link
                href="#services"
                className="px-6 py-3 rounded-xl bg-white ring-1 ring-brand-200 hover:bg-brand-50 text-brand-800 font-semibold"
              >
                See services & pricing
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Chip>PCOS · Thyroid · Diabetes</Chip>
              <Chip>Personalised Indian meal plans</Chip>
              <Chip>100% online</Chip>
            </div>
          </div>

          <div className="relative">
            {practice.heroPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={practice.heroPhoto}
                alt={practice.name}
                className="aspect-[4/5] w-full object-cover rounded-3xl shadow-xl ring-1 ring-brand-100"
              />
            ) : (
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-xl grid place-items-center text-white text-[120px]">
                🥗
              </div>
            )}
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-lg p-4 ring-1 ring-brand-100">
              <p className="text-sm font-semibold text-brand-800">{practice.name}</p>
              <p className="text-xs text-brand-600/70">{practice.credential}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-brand-100 bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-8 grid sm:grid-cols-3 gap-6 text-center">
          <Pillar icon="🎯" title="Personalised plans" desc="Built around your body, labs, and lifestyle — not a generic template." />
          <Pillar icon="💬" title="Ongoing support" desc="Message between sessions and adjust your plan as life changes." />
          <Pillar icon="🔬" title="Evidence-based" desc="Clinical nutrition grounded in the latest research, not fad diets." />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-900">Ways to work together</h2>
          <p className="mt-3 text-brand-800/70">
            Every journey starts with understanding you. Pick what fits — you can always upgrade.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className={`relative rounded-2xl bg-white p-6 ring-1 flex flex-col ${
                s.popular ? "ring-2 ring-brand-500 shadow-lg" : "ring-brand-100"
              }`}
            >
              {s.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-semibold text-brand-900">{s.name}</h3>
              <p className="mt-2 text-sm text-brand-800/70 flex-1">{s.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-brand-700">
                  {formatMoney(s.priceCents)}
                </span>
                <span className="text-xs text-brand-600/60">· {s.durationMin} min</span>
              </div>
              <Link
                href={`/book?service=${s.id}`}
                className="mt-5 text-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
              >
                Book this
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Conditions */}
      <section className="mx-auto max-w-6xl px-6 pb-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-900">Conditions I help with</h2>
          <p className="mt-3 text-brand-800/70">
            Food-first, doctor-friendly plans for the concerns I see most.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            ["⚖️", "Weight loss"],
            ["🩸", "Diabetes"],
            ["🦋", "Thyroid"],
            ["🌸", "PCOS / PCOD"],
            ["❤️", "Cholesterol / BP"],
            ["🌱", "Gut health"],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="rounded-2xl bg-white ring-1 ring-brand-100 p-4 text-center hover:ring-brand-300 transition"
            >
              <div className="text-2xl">{icon}</div>
              <div className="mt-2 text-sm font-medium text-brand-900">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BMI calculator */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-brand-900">Know your starting point</h2>
            <p className="mt-4 text-brand-800/80 max-w-prose">
              Your BMI is just one number — but it&apos;s a useful place to begin. Try the quick
              check, then let&apos;s build a plan around your body, labs, and lifestyle.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-brand-800/80">
              {["Personalised, not generic", "Indian home-cooked meals", "Ongoing WhatsApp-style support"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="text-brand-500">✓</span>
                    {t}
                  </li>
                )
              )}
            </ul>
          </div>
          <BmiCalculator />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream border-y border-brand-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-brand-900 text-center">How it works</h2>
          <div className="mt-12 grid md:grid-cols-4 gap-8">
            {[
              ["1", "Book online", "Choose a service and a time that suits you — no phone tag."],
              ["2", "Share your story", "Complete a short intake so I understand your goals and history."],
              ["3", "Get your plan", "We meet, then I build a custom plan delivered to your patient portal."],
              ["4", "Stay supported", "Message me between sessions and track progress over time."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white grid place-items-center font-bold">
                  {n}
                </div>
                <h3 className="mt-4 font-semibold text-brand-900">{t}</h3>
                <p className="mt-1 text-sm text-brand-800/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-brand-900 text-center">What patients say</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            ["“Finally a diet that works with Indian food. Lost 7kg in 3 months and my PCOS symptoms are so much better.”", "— Priya S., Gurugram"],
            ["“My thyroid and sugar levels are under control now. Dt. Pragya's plans are simple and home-cooked.”", "— Rahul M., Pune"],
            ["“No starving, no weird supplements — just realistic guidance and constant support on WhatsApp.”", "— Sneha K., Bengaluru"],
          ].map(([quote, who]) => (
            <figure key={who} className="rounded-2xl bg-white p-6 ring-1 ring-brand-100">
              <div className="text-brand-400">★★★★★</div>
              <blockquote className="mt-3 text-brand-800">{quote}</blockquote>
              <figcaption className="mt-4 text-sm font-medium text-brand-600">{who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-3xl font-bold text-brand-900 text-center mb-10">
          Frequently asked questions
        </h2>
        <Faq />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to feel better?</h2>
          <p className="mt-3 text-brand-50/90 max-w-xl mx-auto">
            Start with a free discovery call. No pressure — just a conversation about where
            you are and where you want to be.
          </p>
          <Link
            href="/book"
            className="mt-7 inline-block px-7 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50"
          >
            Book your free call →
          </Link>
        </div>
      </section>
    </main>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200">
      {children}
    </span>
  );
}

function Pillar({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div>
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-semibold text-brand-900">{title}</h3>
      <p className="mt-1 text-sm text-brand-800/70">{desc}</p>
    </div>
  );
}
