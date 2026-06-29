import { NextResponse } from "next/server";
import { createBooking, createPatient, findService, bookedSlots } from "@/lib/store";
import { getCurrentUser, signIn } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json();
  const { serviceId, date, time, notes, name, email, password, phone } = body;

  const service = await findService(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Unknown service." }, { status: 400 });
  }
  if (!date || !time) {
    return NextResponse.json({ error: "Pick a date and time." }, { status: 400 });
  }
  // slot still free?
  if ((await bookedSlots(date)).includes(time)) {
    return NextResponse.json(
      { error: "That slot was just taken — please pick another." },
      { status: 409 }
    );
  }

  // Resolve / create the patient.
  let user = await getCurrentUser();
  if (!user) {
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 }
      );
    }
    const created = await createPatient({ name, email, password, phone });
    if ("error" in created) {
      return NextResponse.json({ error: created.error }, { status: 409 });
    }
    const signedIn = await signIn(email, password);
    if ("error" in signedIn) {
      return NextResponse.json({ error: signedIn.error }, { status: 500 });
    }
    user = await getCurrentUser();
  }

  if (!user) {
    return NextResponse.json({ error: "Could not establish session." }, { status: 500 });
  }

  const booking = await createBooking({
    patientId: user.id,
    patientName: user.name,
    patientEmail: user.email,
    serviceId: service.id,
    serviceName: service.name,
    date,
    time,
    payment: "unpaid",
    amountCents: service.priceCents,
    notes,
  });

  if (!booking) {
    return NextResponse.json({ error: "Could not create booking." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, booking });
}
