// Seeds the nutritionist ADMIN account in Supabase Auth.
// Reads keys from .env.local at runtime (this script reads the file; secrets are
// never printed except the admin password it sets, which you need to log in).
//
// Usage:  node scripts/seed-admin.mjs [password]
import { readFileSync } from "node:fs";
import ws from "ws";
// Node < 22 has no global WebSocket; supabase-js constructs a realtime client eagerly.
if (!globalThis.WebSocket) globalThis.WebSocket = ws;
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    console.error("Could not read .env.local");
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || key.includes("REPLACE_WITH")) {
  console.error(
    "✗ SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. Add it, then re-run."
  );
  process.exit(1);
}

const ADMIN_NAME = "Dt. Pragya Choudhary";
const ADMIN_EMAIL = "dieticianpragya@gmail.com";
const password =
  process.argv[2] ||
  "Pragya@" + Math.floor(100000 + Math.random() * 900000); // strong-ish default

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  // paginate through users (small project)
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  let user = await findUserByEmail(ADMIN_EMAIL);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: "admin" },
    });
    if (error) throw error;
    user = data.user;
    console.log("✓ Created admin auth user.");
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: { name: ADMIN_NAME, role: "admin" },
    });
    console.log("✓ Admin user already existed — password reset & role ensured.");
  }

  // Ensure the profile row is role=admin (trigger may have defaulted it to patient
  // on an earlier run, or for pre-existing users).
  const { error: upErr } = await admin
    .from("profiles")
    .upsert(
      { id: user.id, name: ADMIN_NAME, email: ADMIN_EMAIL, role: "admin" },
      { onConflict: "id" }
    );
  if (upErr) throw upErr;

  console.log("\n────────────────────────────────────────────");
  console.log("  ADMIN LOGIN");
  console.log("  Email:    " + ADMIN_EMAIL);
  console.log("  Password: " + password);
  console.log("────────────────────────────────────────────");
  console.log("\nLog in at /login then you'll land on /admin.");
}

main().catch((e) => {
  console.error("✗ Seed failed:", e.message || e);
  process.exit(1);
});
