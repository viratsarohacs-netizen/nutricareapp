import { NextResponse } from "next/server";
import { createPatient } from "@/lib/store";
import { signIn } from "@/lib/session";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (!rateLimit(`signup:${clientIp(req)}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts — try again later." }, { status: 429 });
  }
  const { name, email, password, phone } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const created = await createPatient({ name, email, password, phone });
  if ("error" in created) {
    return NextResponse.json({ error: created.error }, { status: 409 });
  }

  // Log the new (already-confirmed) user straight in.
  const result = await signIn(email, password);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, role: result.role });
}
