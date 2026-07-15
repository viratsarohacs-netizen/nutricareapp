import { NextResponse } from "next/server";
import { signIn } from "@/lib/session";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 20, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts — try again later." }, { status: 429 });
  }
  const { email, password } = await req.json();
  const result = await signIn(email || "", password || "");
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ ok: true, role: result.role });
}
