import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (!rateLimit(`rp:${clientIp(req)}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts — try again later." }, { status: 429 });
  }
  const { token, password } = await req.json();
  if (!token || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data: row } = await admin
    .from("password_resets")
    .select("*")
    .eq("token_hash", tokenHash)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!row) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  const { error } = await admin.auth.admin.updateUserById(row.user_id, { password });
  if (error) {
    return NextResponse.json({ error: "Could not update password." }, { status: 500 });
  }
  await admin.from("password_resets").update({ used: true }).eq("id", row.id);
  return NextResponse.json({ ok: true });
}
