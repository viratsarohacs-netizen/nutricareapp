import { NextResponse } from "next/server";
import { updateBooking } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";
import type { Booking } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Admin can change anything; a patient may only reschedule (date/time) or
  // cancel their OWN booking. RLS ensures a patient can't touch others' rows.
  let patch: Partial<Booking>;
  if (user.role === "admin") {
    patch = body;
  } else {
    patch = {};
    if (body.date !== undefined) patch.date = body.date;
    if (body.time !== undefined) patch.time = body.time;
    if (body.status === "cancelled") patch.status = "cancelled";
  }

  const updated = await updateBooking(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, booking: updated });
}
