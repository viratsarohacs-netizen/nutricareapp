import { createClient } from "@supabase/supabase-js";

// Service-role client — BYPASSES Row Level Security. Server-only.
// Used for privileged operations: creating confirmed auth users on signup,
// reading cross-patient availability, and seeding. Never import in client code.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
