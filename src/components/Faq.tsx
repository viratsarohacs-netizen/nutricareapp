const FAQS: [string, string][] = [
  [
    "How do the online consultations work?",
    "You book a slot, complete a short health intake, and we meet online at your chosen time. After that you get a personalised plan in your patient portal, plus ongoing support between sessions.",
  ],
  [
    "Will I have to give up my favourite foods?",
    "No. My plans are built around Indian home-cooked meals and your preferences — the goal is something you can actually sustain, not a crash diet.",
  ],
  [
    "Can you help with PCOS, thyroid or diabetes?",
    "Yes. A large part of my work is helping people manage PCOS, thyroid, pre-diabetes/diabetes and blood-pressure through food, alongside their doctor's advice.",
  ],
  [
    "How do I track my progress?",
    "Your portal has a progress tracker — log your weight and measurements and watch the trend chart move toward your goal. I review it before every follow-up.",
  ],
  [
    "How do I pay?",
    "Booking is free to reserve. Payment is settled directly with me (details shared after you book). Online payment is coming soon.",
  ],
];

export function Faq() {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-brand-100 rounded-2xl bg-white ring-1 ring-brand-100">
      {FAQS.map(([q, a]) => (
        <details key={q} className="group px-6 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-brand-900">
            {q}
            <span className="ml-4 text-brand-400 transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm text-brand-800/70 leading-relaxed">{a}</p>
        </details>
      ))}
    </div>
  );
}
