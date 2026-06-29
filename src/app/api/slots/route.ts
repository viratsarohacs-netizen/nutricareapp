import { NextResponse } from "next/server";
import { allSlotsForDay } from "@/lib/slots";
import { bookedSlots } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ slots: [] });
  const taken = new Set(await bookedSlots(date));
  const open = allSlotsForDay().filter((s) => !taken.has(s));
  return NextResponse.json({ slots: open });
}
