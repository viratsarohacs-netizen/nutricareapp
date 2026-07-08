import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Pinged daily by Vercel Cron (see vercel.json) so the free-tier Supabase
// project registers activity and never auto-pauses.
export async function GET() {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("services").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
