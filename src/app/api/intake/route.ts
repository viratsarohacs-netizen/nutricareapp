import { NextResponse } from "next/server";
import { getIntake, upsertIntake } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const intake = await getIntake(user.id);
  return NextResponse.json({ intake });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const b = await req.json();
  const num = (v: unknown) => (v === "" || v == null ? null : Number(v));
  const intake = await upsertIntake({
    patientId: user.id,
    age: num(b.age),
    heightCm: num(b.heightCm),
    startWeightKg: num(b.startWeightKg),
    goalWeightKg: num(b.goalWeightKg),
    activityLevel: b.activityLevel || null,
    dietPref: b.dietPref || null,
    conditions: b.conditions?.trim() || null,
    allergies: b.allergies?.trim() || null,
    goals: b.goals?.trim() || null,
  });
  if (!intake) return NextResponse.json({ error: "Could not save." }, { status: 500 });
  return NextResponse.json({ ok: true, intake });
}
