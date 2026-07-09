import { NextResponse } from "next/server";
import { createDoc, findPatientById } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";
import { notifyDocShared } from "@/lib/email";
import type { DocType } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { patientId, title, type, content } = await req.json();
  if (!patientId || !title || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const doc = await createDoc({
    patientId,
    title,
    type: (type as DocType) || "plan",
    content,
    createdBy: user.name,
  });
  if (!doc) return NextResponse.json({ error: "Could not save document." }, { status: 500 });

  const patient = await findPatientById(patientId);
  if (patient) await notifyDocShared(patient.email, patient.name, doc);
  return NextResponse.json({ ok: true, doc });
}
