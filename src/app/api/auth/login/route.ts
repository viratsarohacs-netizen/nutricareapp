import { NextResponse } from "next/server";
import { signIn } from "@/lib/session";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const result = await signIn(email || "", password || "");
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ ok: true, role: result.role });
}
