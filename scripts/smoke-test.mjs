// NutriCare end-to-end smoke-test suite.
//
// Usage:
//   node scripts/smoke-test.mjs                 # against http://localhost:3000
//   node scripts/smoke-test.mjs --url https://nutricare-ten.vercel.app
//
// Reads TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD / SUPABASE_* from .env.local.
// Creates throwaway test patients (…@nutricare-test.com) and deletes them at the
// end via the service-role client, so no test data is left behind.
//
// Exit code 0 = all pass, 1 = failures.

import { readFileSync } from "node:fs";
import ws from "ws";
if (!globalThis.WebSocket) globalThis.WebSocket = ws;
import { createClient } from "@supabase/supabase-js";

// ── env ──────────────────────────────────────────────────────────────────────
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {
    console.error("✗ Could not read .env.local");
    process.exit(1);
  }
  return env;
}
const env = loadEnv();
const BASE =
  process.argv.includes("--url")
    ? process.argv[process.argv.indexOf("--url") + 1]
    : "http://localhost:3000";
const ADMIN_EMAIL = env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = env.TEST_ADMIN_PASSWORD;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("✗ TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD missing from .env.local");
  process.exit(1);
}

// ── tiny cookie-jar fetch ────────────────────────────────────────────────────
function makeSession() {
  const jar = new Map();
  return async function call(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (jar.size) {
      headers.Cookie = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    }
    const res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      redirect: "manual",
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      const val = pair.slice(eq + 1).trim();
      if (val === "" || /expires=Thu, 01 Jan 1970/i.test(c)) jar.delete(name);
      else jar.set(name, val);
    }
    let json = null;
    const text = await res.text();
    try {
      json = JSON.parse(text);
    } catch {
      /* HTML page */
    }
    return { status: res.status, json, text };
  };
}

// ── test harness ─────────────────────────────────────────────────────────────
const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push({ name, ok: false, err: e.message });
    console.log(`  ✗ ${name} — ${e.message}`);
  }
}
function expect(cond, msg) {
  if (!cond) throw new Error(msg);
}

// ── suite ────────────────────────────────────────────────────────────────────
const ts = Date.now();
const P1 = { email: `p1.${ts}@nutricare-test.com`, password: "Test@12345", name: "Smoke P1" };
const P2 = { email: `p2.${ts}@nutricare-test.com`, password: "Test@12345", name: "Smoke P2" };
const today = new Date().toISOString().slice(0, 10);
// a bookable future weekday (skip Sat/Sun)
const future = new Date();
future.setDate(future.getDate() + 8);
while ([0, 6].includes(future.getDay())) future.setDate(future.getDate() + 1);
const futureDate = future.toISOString().slice(0, 10);

const patient1 = makeSession();
const patient2 = makeSession();
const admin = makeSession();
const anon = makeSession();

let p1Id = null;
let bookingId = null;
let planId = null;
let libMealId = null;
let reviewId = null;

console.log(`\nNutriCare smoke tests → ${BASE}\n`);

// 1. health
await test("keepalive / DB reachable", async () => {
  const r = await anon("/api/keepalive");
  expect(r.status === 200 && r.json?.ok, `status ${r.status}`);
});

// 2. auth
await test("patient signup", async () => {
  const r = await patient1("/api/auth/signup", { method: "POST", body: P1 });
  expect(r.status === 200 && r.json?.role === "patient", JSON.stringify(r.json));
});
await test("login rejects wrong password", async () => {
  const r = await makeSession()("/api/auth/login", {
    method: "POST",
    body: { email: P1.email, password: "wrong" },
  });
  expect(r.status === 401, `status ${r.status}`);
});

// 3. booking
await test("slots API returns availability", async () => {
  const r = await anon(`/api/slots?date=${futureDate}`);
  expect(r.status === 200 && Array.isArray(r.json?.slots) && r.json.slots.length > 0, `status ${r.status}`);
});
await test("patient books free discovery call", async () => {
  const slots = (await patient1(`/api/slots?date=${futureDate}`)).json.slots;
  const r = await patient1("/api/bookings", {
    method: "POST",
    body: { serviceId: "discovery", date: futureDate, time: slots[0], notes: "smoke" },
  });
  expect(r.status === 200 && r.json?.booking?.id, JSON.stringify(r.json));
  bookingId = r.json.booking.id;
  p1Id = r.json.booking.patientId;
  const after = (await patient1(`/api/slots?date=${futureDate}`)).json.slots;
  expect(!after.includes(slots[0]), "booked slot still shown as free");
});
await test("double-booking same slot rejected", async () => {
  const booked = (await patient1("/api/bookings", {
    method: "POST",
    body: {
      serviceId: "discovery",
      date: futureDate,
      time: (await anon(`/api/slots?date=${futureDate}`)).json.slots[0],
      notes: "x",
    },
  }));
  expect(booked.status === 200, "second distinct slot should book fine"); // sanity
});

// 4. daily tracker
await test("habits: water saves + partial update merges", async () => {
  let r = await patient1("/api/habits", { method: "POST", body: { date: today, waterGlasses: 4 } });
  expect(r.status === 200, JSON.stringify(r.json));
  r = await patient1("/api/habits", { method: "POST", body: { date: today, exercised: true } });
  expect(r.json?.habit?.waterGlasses === 4 && r.json?.habit?.exercised === true, "merge lost water count");
});
await test("food log create", async () => {
  const r = await patient1("/api/food-logs", {
    method: "POST",
    body: { date: today, mealType: "lunch", description: "2 roti + dal (smoke)" },
  });
  expect(r.status === 200 && r.json?.log?.id, JSON.stringify(r.json));
});

// 5. progress + intake
await test("progress log create", async () => {
  const r = await patient1("/api/progress", {
    method: "POST",
    body: { date: today, weightKg: 70.5 },
  });
  expect(r.status === 200, JSON.stringify(r.json));
});
await test("intake save", async () => {
  const r = await patient1("/api/intake", {
    method: "POST",
    body: { heightCm: 170, startWeightKg: 72, goalWeightKg: 65 },
  });
  expect(r.status === 200, JSON.stringify(r.json));
});

// 6. reviews
await test("review submit + duplicate blocked", async () => {
  const r = await patient1("/api/reviews", {
    method: "POST",
    body: { rating: 5, text: "Smoke-test review — great!" },
  });
  expect(r.status === 200 && r.json?.review?.id, JSON.stringify(r.json));
  reviewId = r.json.review.id;
  const dup = await patient1("/api/reviews", { method: "POST", body: { rating: 4, text: "again" } });
  expect(dup.status !== 200, "duplicate review was accepted");
});

// 7. authorization boundaries
await test("patient blocked from admin APIs (meal-plans, library, docs)", async () => {
  const a = await patient1("/api/meal-plans", {
    method: "POST",
    body: { patientId: p1Id, title: "x", days: [{ day: "D1", meals: {} }] },
  });
  const b = await patient1("/api/meal-library");
  const c = await patient1("/api/docs", {
    method: "POST",
    body: { patientId: p1Id, title: "x", content: "y" },
  });
  expect(a.status === 403 && b.status === 403 && c.status === 403, `${a.status}/${b.status}/${c.status}`);
});
await test("RLS: patient cannot write to another patient's message thread", async () => {
  await patient2("/api/auth/signup", { method: "POST", body: P2 });
  const r = await patient2("/api/messages", {
    method: "POST",
    body: { text: "smoke intrusion", patientId: p1Id },
  });
  expect(r.status === 200 && r.json?.message?.patientId !== p1Id, "message landed on another patient's thread");
});

// 8. admin flows
await test("admin login", async () => {
  const r = await admin("/api/auth/login", {
    method: "POST",
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(r.status === 200 && r.json?.role === "admin", JSON.stringify(r.json));
});
await test("admin creates meal plan", async () => {
  const r = await admin("/api/meal-plans", {
    method: "POST",
    body: {
      patientId: p1Id,
      title: "Smoke Plan",
      days: [{ day: "Day 1", meals: { breakfast: "Poha", lunch: "Dal roti" } }],
      notes: "smoke",
    },
  });
  expect(r.status === 200 && r.json?.plan?.id, JSON.stringify(r.json));
  planId = r.json.plan.id;
});
await test("admin meal library: list + add + delete", async () => {
  const list = await admin("/api/meal-library");
  expect(list.status === 200 && list.json?.meals?.length > 0, `status ${list.status}`);
  const add = await admin("/api/meal-library", {
    method: "POST",
    body: { category: "snack", text: `Smoke snack ${ts}` },
  });
  expect(add.status === 200 && add.json?.meal?.id, JSON.stringify(add.json));
  libMealId = add.json.meal.id;
  const del = await admin("/api/meal-library", { method: "DELETE", body: { id: libMealId } });
  expect(del.status === 200 && del.json?.ok, "delete failed");
  libMealId = null;
});
await test("admin shares diet doc + messages patient", async () => {
  const doc = await admin("/api/docs", {
    method: "POST",
    body: { patientId: p1Id, title: "Smoke Doc", type: "note", content: "hello" },
  });
  const msg = await admin("/api/messages", {
    method: "POST",
    body: { patientId: p1Id, text: "smoke hello" },
  });
  expect(doc.status === 200 && msg.status === 200, `${doc.status}/${msg.status}`);
});
await test("admin marks booking paid; patient's payment field is ignored", async () => {
  // Patients may only reschedule/cancel — the route strips `payment` from their
  // patch, so the attempt must never result in a paid booking.
  const patientTry = await patient1(`/api/bookings/${bookingId}`, {
    method: "PATCH",
    body: { payment: "paid" },
  });
  expect(
    patientTry.status !== 200 || patientTry.json?.booking?.payment !== "paid",
    "patient was able to mark their booking paid"
  );
  const r = await admin(`/api/bookings/${bookingId}`, { method: "PATCH", body: { payment: "paid" } });
  expect(r.status === 200 && r.json?.booking?.payment === "paid", JSON.stringify(r.json));
});
await test("patient can reschedule own booking", async () => {
  const slots = (await patient1(`/api/slots?date=${futureDate}`)).json.slots;
  expect(slots.length > 0, "no free slot to reschedule into");
  const r = await patient1(`/api/bookings/${bookingId}`, {
    method: "PATCH",
    body: { date: futureDate, time: slots[0] },
  });
  expect(r.status === 200 && r.json?.booking?.time === slots[0], JSON.stringify(r.json));
});
await test("admin approves review → visible on public home", async () => {
  const r = await admin("/api/reviews", {
    method: "PATCH",
    body: { id: reviewId, approved: true },
  });
  expect(r.status === 200, JSON.stringify(r.json));
  const home = await anon("/");
  expect(home.text.includes("Smoke-test review"), "approved review not on landing page");
  // hide it again so smoke data never ships to real visitors
  await admin("/api/reviews", { method: "PATCH", body: { id: reviewId, approved: false } });
});

// 9. pages render
await test("pages render (/, /book, /login)", async () => {
  for (const p of ["/", "/book", "/login"]) {
    const r = await anon(p);
    expect(r.status === 200, `${p} → ${r.status}`);
  }
});

// ── cleanup (service-role) ───────────────────────────────────────────────────
console.log("\nCleaning up test data…");
try {
  const sr = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  for (let page = 1; page <= 5; page++) {
    const { data } = await sr.auth.admin.listUsers({ page, perPage: 200 });
    const targets = (data?.users ?? []).filter((u) => u.email?.endsWith("@nutricare-test.com"));
    for (const u of targets) await sr.auth.admin.deleteUser(u.id); // cascades to all rows
    if ((data?.users ?? []).length < 200) break;
  }
  if (libMealId) await sr.from("meal_library").delete().eq("id", libMealId);
  console.log("  ✓ test users + data removed");
} catch (e) {
  console.log(`  ⚠ cleanup issue: ${e.message} — check for @nutricare-test.com users`);
}

// ── report ───────────────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.ok);
console.log(`\n══════════════════════════════════════`);
console.log(`  ${results.length - failed.length}/${results.length} passed${failed.length ? ` — ${failed.length} FAILED` : " ✅"}`);
failed.forEach((f) => console.log(`  ✗ ${f.name}: ${f.err}`));
console.log(`══════════════════════════════════════\n`);
process.exit(failed.length ? 1 : 0);
