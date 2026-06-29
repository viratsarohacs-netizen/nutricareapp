import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import {
  listBookings,
  listPatients,
  listDocsForPatient,
  listMessagesForPatient,
} from "@/lib/store";
import { formatMoney } from "@/lib/slots";
import { AdminConsole } from "@/components/AdminConsole";
import { toSafe } from "@/lib/session";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [bookings, patientUsers] = await Promise.all([listBookings(), listPatients()]);
  const patients = await Promise.all(
    patientUsers.map(async (p) => ({
      user: toSafe(p),
      docs: await listDocsForPatient(p.id),
      messages: await listMessagesForPatient(p.id),
      bookings: bookings.filter((b) => b.patientId === p.id),
    }))
  );

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== "cancelled");
  const revenue = bookings
    .filter((b) => b.payment === "paid")
    .reduce((sum, b) => sum + b.amountCents, 0);

  const adminName = user.name || "Nutritionist";

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold text-brand-900">Practice dashboard</h1>
      <p className="mt-1 text-brand-800/70">Welcome back, {adminName}.</p>

      {/* Stats */}
      <div className="mt-8 grid sm:grid-cols-4 gap-4">
        <Stat label="Upcoming sessions" value={String(upcoming.length)} />
        <Stat label="Total bookings" value={String(bookings.length)} />
        <Stat label="Patients" value={String(patients.length)} />
        <Stat label="Revenue (paid)" value={formatMoney(revenue)} />
      </div>

      <AdminConsole patients={patients} upcoming={upcoming} />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-brand-100 p-5">
      <div className="text-2xl font-bold text-brand-700">{value}</div>
      <div className="text-xs text-brand-600/70 mt-1">{label}</div>
    </div>
  );
}
