import { NextResponse } from "next/server";
import { addFoodLog } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";

const MEALS = ["breakfast", "lunch", "snack", "dinner"] as const;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { date, mealType, description } = await req.json();
  if (!date || !MEALS.includes(mealType) || !description?.trim()) {
    return NextResponse.json({ error: "Date, meal and description required." }, { status: 400 });
  }
  const log = await addFoodLog({
    patientId: user.id,
    date,
    mealType,
    description: description.trim().slice(0, 500),
  });
  if (!log) return NextResponse.json({ error: "Could not save." }, { status: 500 });
  return NextResponse.json({ ok: true, log });
}
