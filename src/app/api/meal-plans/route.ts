import { NextResponse } from "next/server";
import { createMealPlan, findPatientById } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";
import { notifyPlanShared } from "@/lib/email";
import type { MealDay } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { patientId, title, days, notes } = await req.json();
  if (!patientId || !title?.trim() || !Array.isArray(days) || days.length === 0) {
    return NextResponse.json({ error: "Title and at least one day required." }, { status: 400 });
  }
  // sanitize days
  const cleanDays: MealDay[] = days.map((d: MealDay, i: number) => ({
    day: (d.day || `Day ${i + 1}`).slice(0, 40),
    meals: {
      breakfast: d.meals?.breakfast?.trim() || undefined,
      lunch: d.meals?.lunch?.trim() || undefined,
      snack: d.meals?.snack?.trim() || undefined,
      dinner: d.meals?.dinner?.trim() || undefined,
    },
  }));
  const plan = await createMealPlan({
    patientId,
    title: title.trim(),
    days: cleanDays,
    notes: notes?.trim() || null,
    createdBy: user.name,
  });
  if (!plan) return NextResponse.json({ error: "Could not save plan." }, { status: 500 });

  const patient = await findPatientById(patientId);
  if (patient) await notifyPlanShared(patient.email, patient.name, plan);
  return NextResponse.json({ ok: true, plan });
}
