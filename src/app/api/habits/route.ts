import { NextResponse } from "next/server";
import { upsertHabit } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const b = await req.json();
  const date = b.date || new Date().toISOString().slice(0, 10);
  const habit = await upsertHabit({
    patientId: user.id,
    date,
    waterGlasses:
      b.waterGlasses !== undefined
        ? Math.max(0, Math.min(20, Number(b.waterGlasses)))
        : undefined,
    sleepHours:
      b.sleepHours !== undefined
        ? b.sleepHours === "" || b.sleepHours === null
          ? null
          : Math.max(0, Math.min(24, Number(b.sleepHours)))
        : undefined,
    exercised: b.exercised !== undefined ? !!b.exercised : undefined,
    followedPlan: b.followedPlan !== undefined ? !!b.followedPlan : undefined,
  });
  if (!habit) return NextResponse.json({ error: "Could not save." }, { status: 500 });
  return NextResponse.json({ ok: true, habit });
}
