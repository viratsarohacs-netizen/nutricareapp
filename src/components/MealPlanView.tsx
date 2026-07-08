import type { MealPlan } from "@/lib/types";

const MEAL_META: [key: "breakfast" | "lunch" | "snack" | "dinner", label: string, icon: string][] = [
  ["breakfast", "Breakfast", "🌅"],
  ["lunch", "Lunch", "☀️"],
  ["snack", "Snack", "🍎"],
  ["dinner", "Dinner", "🌙"],
];

export function MealPlanView({ plan }: { plan: MealPlan }) {
  return (
    <div className="rounded-xl ring-1 ring-brand-100 overflow-hidden">
      <div className="bg-brand-50 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-brand-900">{plan.title}</p>
          <p className="text-xs text-brand-600/70">
            by {plan.createdBy} ·{" "}
            {new Date(plan.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-brand-200 text-brand-800 font-medium">
          {plan.days.length} day{plan.days.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="divide-y divide-brand-100">
        {plan.days.map((d, i) => (
          <details key={i} className="group" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 hover:bg-brand-50/50">
              <span className="text-sm font-semibold text-brand-800">{d.day}</span>
              <span className="text-brand-400 text-xs transition-transform group-open:rotate-90">
                ▶
              </span>
            </summary>
            <div className="px-4 pb-3 grid sm:grid-cols-2 gap-2">
              {MEAL_META.map(([key, label, icon]) =>
                d.meals[key] ? (
                  <div key={key} className="rounded-lg bg-cream ring-1 ring-brand-100 px-3 py-2">
                    <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
                      {icon} {label}
                    </p>
                    <p className="mt-0.5 text-sm text-brand-900 whitespace-pre-wrap">
                      {d.meals[key]}
                    </p>
                  </div>
                ) : null
              )}
            </div>
          </details>
        ))}
      </div>

      {plan.notes && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 text-sm text-amber-900">
          <span className="font-semibold">Notes:</span> {plan.notes}
        </div>
      )}
    </div>
  );
}
