import { NextResponse } from "next/server";
import { listProgress, addProgress } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const logs = await listProgress(user.id);
  return NextResponse.json({ logs });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { date, weightKg, waistCm, note } = await req.json();
  const w = Number(weightKg);
  if (!date || !w || w <= 0 || w > 500) {
    return NextResponse.json({ error: "Enter a valid date and weight." }, { status: 400 });
  }
  const log = await addProgress({
    patientId: user.id,
    date,
    weightKg: w,
    waistCm: waistCm ? Number(waistCm) : null,
    note: note?.trim() || null,
  });
  if (!log) return NextResponse.json({ error: "Could not save entry." }, { status: 500 });
  return NextResponse.json({ ok: true, log });
}
