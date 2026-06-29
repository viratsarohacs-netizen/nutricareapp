import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import {
  listBookingsForPatient,
  listDocsForPatient,
  listMessagesForPatient,
} from "@/lib/store";
import { formatDateLong, formatTime, formatMoney } from "@/lib/slots";
import { MessageThread } from "@/components/MessageThread";

const typeBadge: Record<string, string> = {
  plan: "bg-brand-100 text-brand-700",
  report: "bg-amber-100 text-amber-700",
  note: "bg-sky-100 text-sky-700",
};

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  const [bookings, docs, messages] = await Promise.all([
    listBookingsForPatient(user.id),
    listDocsForPatient(user.id),
    listMessagesForPatient(user.id),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== "cancelled");
  const past = bookings.filter((b) => b.date < today || b.status === "completed");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-900">Hi {user.name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-brand-800/70">Your nutrition journey, all in one place.</p>
        </div>
        <Link
          href="/book"
          className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium"
        >
          Book another session
        </Link>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        {/* Appointments */}
        <section className="lg:col-span-2 space-y-6">
          <Panel title="Upcoming appointments">
            {upcoming.length === 0 ? (
              <Empty text="No upcoming sessions. Ready to book one?" />
            ) : (
              <ul className="space-y-3">
                {upcoming.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between rounded-xl bg-brand-50 ring-1 ring-brand-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-brand-900">{b.serviceName}</p>
                      <p className="text-sm text-brand-700">
                        {formatDateLong(b.date)} · {formatTime(b.time)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-200 text-brand-800 font-medium capitalize">
                      {b.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="My diet plans & documents">
            {docs.length === 0 ? (
              <Empty text="Your nutritionist will share plans and notes here." />
            ) : (
              <ul className="space-y-3">
                {docs.map((d) => (
                  <li key={d.id} className="rounded-xl ring-1 ring-brand-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-brand-900">{d.title}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeBadge[d.type]}`}
                      >
                        {d.type}
                      </span>
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-brand-800/80">
                      {d.content}
                    </pre>
                    <p className="mt-2 text-xs text-brand-600/60">— {d.createdBy}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {past.length > 0 && (
            <Panel title="Past sessions">
              <ul className="space-y-2">
                {past.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between text-sm text-brand-800/70 px-1"
                  >
                    <span>
                      {b.serviceName} · {formatDateLong(b.date)}
                    </span>
                    <span>{formatMoney(b.amountCents)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </section>

        {/* Messages */}
        <section>
          <Panel title="Messages" full>
            <MessageThread messages={messages} patientId={user.id} />
          </Panel>
        </section>
      </div>
    </main>
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
      <div className={full ? "h-[420px]" : ""}>{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-brand-600/60">{text}</p>;
}
