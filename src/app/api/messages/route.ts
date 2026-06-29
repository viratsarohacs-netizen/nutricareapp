import { NextResponse } from "next/server";
import { createMessage } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { text, patientId } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  // Patients can only message on their own thread; admin can target any patient.
  const targetPatient = user.role === "admin" ? patientId : user.id;
  if (!targetPatient) {
    return NextResponse.json({ error: "No patient" }, { status: 400 });
  }

  const msg = await createMessage({
    patientId: targetPatient,
    sender: user.role === "admin" ? "nutritionist" : "patient",
    text: text.trim(),
  });
  if (!msg) return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  return NextResponse.json({ ok: true, message: msg });
}
