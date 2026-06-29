import { listServices } from "@/lib/store";
import { upcomingDays } from "@/lib/slots";
import { getCurrentUser } from "@/lib/session";
import { BookingFlow } from "@/components/BookingFlow";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const services = await listServices();
  const days = upcomingDays();
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-brand-900">Book your session</h1>
      <p className="mt-2 text-brand-800/70">
        A few quick steps and you&apos;re on the calendar.
      </p>
      <BookingFlow
        services={services}
        days={days}
        initialService={service ?? null}
        user={user}
      />
    </main>
  );
}
