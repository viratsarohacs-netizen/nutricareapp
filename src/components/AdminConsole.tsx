"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Booking,
  DietDoc,
  Message,
  SafeUser,
  DocType,
  ProgressLog,
  Intake,
  MealPlan,
  FoodLog,
  DailyHabit,
} from "@/lib/types";
import { formatDateLong, formatTime, formatMoney } from "@/lib/slots";
import { MessageThread } from "@/components/MessageThread";
import { ProgressPanel } from "@/components/ProgressPanel";
import { MealPlanBuilder } from "@/components/MealPlanBuilder";
import { MealPlanView } from "@/components/MealPlanView";

interface PatientBundle {
  user: SafeUser;
  docs: DietDoc[];
  messages: Message[];
  bookings: Booking[];
  progress: ProgressLog[];
  intake: Intake | null;
  mealPlans: MealPlan[];
  foodLogs: FoodLog[];
  habits: DailyHabit[];
}

export function AdminConsole({
  patients,
  upcoming,
}: {
  patients: PatientBundle[];
  upcoming: Booking[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    patients[0]?.user.id ?? null
  );
  const selected = patients.find((p) => p.user.id === selectedId) ?? null;

  return (
    <div className="mt-8 grid lg:grid-cols-3 gap-6">
      {/* Schedule */}
      <section className="lg:col-span-1">
        <Panel title="Upcoming schedule">
          {upcoming.length === 0 ? (
            <p className="text-sm text-brand-600/60">No upcoming sessions.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((b) => (
                <li key={b.id} className="rounded-xl bg-brand-50 ring-1 ring-brand-100 px-3 py-2.5">
                  <p className="text-sm font-semibold text-brand-900">{b.patientName}</p>
                  <p className="text-xs text-brand-700">{b.serviceName}</p>
                  <p className="text-xs text-brand-600/70 mt-0.5">
                    {formatDateLong(b.date)} · {formatTime(b.time)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>

      {/* Patients + detail */}
      <section className="lg:col-span-2 space-y-6">
        <Panel title="Patients">
          <div className="flex flex-wrap gap-2">
            {patients.map((p) => (
              <button
                key={p.user.id}
                onClick={() => setSelectedId(p.user.id)}
                className={`px-3 py-1.5 rounded-lg text-sm ring-1 ${
                  selectedId === p.user.id
                    ? "bg-brand-600 text-white ring-brand-600"
                    : "bg-white ring-brand-100 text-brand-800 hover:bg-brand-50"
                }`}
              >
                {p.user.name}
              </button>
            ))}
          </div>
        </Panel>

        {selected && <PatientDetail key={selected.user.id} bundle={selected} />}
      </section>
    </div>
  );
}

function PatientDetail({ bundle }: { bundle: PatientBundle }) {
  const { user, docs, messages, bookings, progress, intake, mealPlans, foodLogs, habits } = bundle;
  return (
    <div className="space-y-6">
      <Panel title={`${user.name} — overview`}>
        <p className="text-sm text-brand-800/70">
          {user.email}
          {user.phone ? ` · ${user.phone}` : ""}
        </p>
        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-6">
        <Panel title="Health profile">
          {intake?.updatedAt ? (
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <IntakeRow k="Age" v={intake.age?.toString()} />
              <IntakeRow k="Height" v={intake.heightCm ? `${intake.heightCm} cm` : ""} />
              <IntakeRow k="Start" v={intake.startWeightKg ? `${intake.startWeightKg} kg` : ""} />
              <IntakeRow k="Goal" v={intake.goalWeightKg ? `${intake.goalWeightKg} kg` : ""} />
              <IntakeRow k="Activity" v={intake.activityLevel} />
              <IntakeRow k="Diet" v={intake.dietPref} />
              <IntakeRow k="Conditions" v={intake.conditions} block />
              <IntakeRow k="Allergies" v={intake.allergies} block />
              <IntakeRow k="Goals" v={intake.goals} block />
            </div>
          ) : (
            <p className="text-sm text-brand-600/60">Patient hasn&apos;t filled their health profile yet.</p>
          )}
        </Panel>

        <Panel title="Progress">
          <ProgressPanel
            logs={progress}
            goalWeightKg={intake?.goalWeightKg}
            startWeightKg={intake?.startWeightKg}
            readOnly
          />
        </Panel>
      </div>

      <Panel title="Meal plans">
        {mealPlans.length > 0 && (
          <div className="space-y-3 mb-4">
            {mealPlans.map((p) => (
              <MealPlanView key={p.id} plan={p} />
            ))}
          </div>
        )}
        <MealPlanBuilder patientId={user.id} />
      </Panel>

      <div className="grid md:grid-cols-2 gap-6">
        <Panel title="Food journal (recent)">
          {foodLogs.length === 0 ? (
            <p className="text-sm text-brand-600/60">No meals logged yet.</p>
          ) : (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto text-sm">
              {foodLogs.map((l) => (
                <li key={l.id} className="flex gap-2 text-brand-800/80">
                  <span className="shrink-0 text-xs text-brand-600/70 w-14">
                    {new Date(l.date + "T00:00:00").toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="font-medium text-brand-700 capitalize shrink-0 w-20">
                    {l.mealType}
                  </span>
                  <span>{l.description}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Habits (last 7 days)">
          {habits.length === 0 ? (
            <p className="text-sm text-brand-600/60">No habit entries yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {habits.map((h) => (
                <li key={h.id} className="flex items-center gap-3 text-brand-800/80">
                  <span className="text-xs text-brand-600/70 w-14 shrink-0">
                    {new Date(h.date + "T00:00:00").toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span title="water">💧 {h.waterGlasses}</span>
                  {h.sleepHours != null && <span title="sleep">😴 {h.sleepHours}h</span>}
                  <span title="exercised">{h.exercised ? "🏃 ✓" : "🏃 ✗"}</span>
                  <span title="followed plan">{h.followedPlan ? "🥗 ✓" : "🥗 ✗"}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Panel title="Diet plans & notes">
          <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {docs.length === 0 && (
              <p className="text-sm text-brand-600/60">No documents shared yet.</p>
            )}
            {docs.map((d) => (
              <li key={d.id} className="rounded-lg ring-1 ring-brand-100 px-3 py-2">
                <p className="text-sm font-medium text-brand-900">{d.title}</p>
                <p className="text-xs text-brand-600/60 capitalize">{d.type}</p>
              </li>
            ))}
          </ul>
          <AddDocForm patientId={user.id} />
        </Panel>

        <Panel title="Messages" full>
          <MessageThread messages={messages} patientId={user.id} asAdmin />
        </Panel>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const free = booking.amountCents === 0;
  const paid = booking.payment === "paid";

  async function togglePaid() {
    setBusy(true);
    await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment: paid ? "unpaid" : "paid" }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="rounded-lg bg-brand-50 ring-1 ring-brand-100 px-3 py-2">
      <p className="font-medium text-brand-900">{booking.serviceName}</p>
      <p className="text-xs text-brand-700">
        {formatDateLong(booking.date)} · {formatTime(booking.time)} ·{" "}
        {formatMoney(booking.amountCents)}
      </p>
      {!free && (
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {paid ? "Paid" : "Unpaid"}
          </span>
          <button
            onClick={togglePaid}
            disabled={busy}
            className="text-[11px] text-brand-600 hover:underline disabled:opacity-50"
          >
            {paid ? "Mark unpaid" : "Mark paid"}
          </button>
        </div>
      )}
    </div>
  );
}

function AddDocForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocType>("plan");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setBusy(true);
    await fetch("/api/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, title, type, content }),
    });
    setTitle("");
    setContent("");
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2 border-t border-brand-100 pt-3">
      <p className="text-sm font-medium text-brand-800">Share a new plan / note</p>
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="flex-1 rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DocType)}
          className="rounded-lg ring-1 ring-brand-200 bg-white px-2 py-2 text-sm"
        >
          <option value="plan">Plan</option>
          <option value="report">Report</option>
          <option value="note">Note</option>
        </select>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="Meal plan, guidance, lab notes…"
        className="w-full rounded-lg ring-1 ring-brand-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 outline-none"
      />
      <button
        disabled={busy}
        className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-50"
      >
        {busy ? "Saving…" : "Share with patient"}
      </button>
    </form>
  );
}

function IntakeRow({ k, v, block }: { k: string; v?: string | null; block?: boolean }) {
  if (!v) return null;
  return (
    <div className={block ? "col-span-2 mt-1" : ""}>
      <span className="text-brand-600/70">{k}: </span>
      <span className="text-brand-900 font-medium capitalize">{v}</span>
    </div>
  );
}

function Panel({
  title,
  children,
  full,
}: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-brand-100 p-5">
      <h2 className="font-semibold text-brand-900 mb-4">{title}</h2>
      <div className={full ? "h-[360px] flex flex-col" : ""}>{children}</div>
    </div>
  );
}
