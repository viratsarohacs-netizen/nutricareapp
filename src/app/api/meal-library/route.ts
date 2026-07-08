import { NextResponse } from "next/server";
import { listMealLibrary, addLibraryMeal, deleteLibraryMeal } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";
import type { MealType } from "@/lib/types";

const MEALS = ["breakfast", "lunch", "snack", "dinner"] as const;

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ meals: await listMealLibrary() });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { category, text } = await req.json();
  if (!MEALS.includes(category) || !text?.trim()) {
    return NextResponse.json({ error: "Category and text required." }, { status: 400 });
  }
  const meal = await addLibraryMeal(category as MealType, text.trim().slice(0, 200));
  if (!meal) return NextResponse.json({ error: "Could not save." }, { status: 500 });
  return NextResponse.json({ ok: true, meal });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const ok = await deleteLibraryMeal(id);
  return NextResponse.json({ ok });
}
