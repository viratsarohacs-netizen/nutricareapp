import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPasswordReset } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const SITE = "https://nutricare-ten.vercel.app";

// Always answers { ok: true } — never reveals whether an email is registered.
export async function POST(req: Request) {
  if (!rateLimit(`fp:${clientIp(req)}`, 8, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts — try again later." }, { status: 429 });
  }
  const { email } = await req.json();
  if (!email?.trim()) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  // find the auth user by email via profiles (email column mirrors auth)
  const { data: profile } = await admin
    .from("profiles")
    .select("id, name, email")
    .ilike("email", email.trim())
    .maybeSingle();

  if (profile) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await admin.from("password_resets").insert({
      user_id: profile.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 60 * 60_000).toISOString(),
    });
    await sendPasswordReset(
      profile.email,
      profile.name,
      `${SITE}/reset-password?token=${token}`
    );
  }
  return NextResponse.json({ ok: true });
}
