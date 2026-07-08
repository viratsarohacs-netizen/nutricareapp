# NutriCare — Feature Registry

Single source of truth for what's built, where it lives, and what's planned.
**Live app:** https://nutricare-ten.vercel.app · **Repo:** https://github.com/viratsarohacs-netizen/nutricareapp

Legend: ✅ live · 🔜 planned · 💤 deferred

---

## 1. Public website (`/`)

| Feature | Status | Notes / key files |
|---|---|---|
| Landing page (hero, services & INR pricing from DB) | ✅ | `src/app/page.tsx`, prices in `services` table |
| Conditions-I-help-with grid | ✅ | Weight loss, diabetes, thyroid, PCOS, cholesterol/BP, gut health |
| Interactive BMI calculator (lead magnet) | ✅ | `src/components/BmiCalculator.tsx` |
| How-it-works timeline | ✅ | `src/app/page.tsx` |
| Real patient testimonials (only admin-approved reviews) | ✅ | Section auto-hides when none approved; `listApprovedReviews` |
| FAQ accordion | ✅ | `src/components/Faq.tsx` |
| Practice branding from one config file | ✅ | `src/lib/config.ts` (name, tagline, services hours, currency, hero photo) |
| Hero photo slot | ✅ | Put image in `public/`, set `heroPhoto` in config; placeholder if empty |

## 2. Booking (`/book`)

| Feature | Status | Notes |
|---|---|---|
| 4-step flow: service → date/time → details → review & confirm | ✅ | `src/components/BookingFlow.tsx` |
| Live slot availability (cross-patient, no double-booking) | ✅ | `/api/slots`, race-checked again on create |
| Inline account creation while booking | ✅ | Auto-confirmed Supabase user |
| Working hours / horizon config | ✅ | `practice.availability` in `config.ts` |
| Online payment | 💤 | Bookings created `unpaid`; admin marks paid. Razorpay planned |

## 3. Patient portal (`/dashboard`)

| Feature | Status | Notes |
|---|---|---|
| "Today" panel — water tracker (8-glass bar), exercised / followed-plan / sleep, food journal | ✅ | `DailyTracker.tsx`, `/api/habits`, `/api/food-logs` |
| Structured meal plans (day/meal grid, expandable) | ✅ | `MealPlanView.tsx` |
| Progress tracking — weight/waist log + trend chart + goal % | ✅ | `ProgressPanel.tsx`, `LineChart.tsx` (dependency-free SVG), `/api/progress` |
| Health intake questionnaire (age, height, goal, conditions, allergies…) | ✅ | `IntakeForm.tsx`, `/api/intake` |
| Upcoming appointments with self-service reschedule / cancel | ✅ | `RescheduleControls.tsx`, PATCH `/api/bookings/[id]` |
| Diet plans & documents shared by the dietitian | ✅ | `diet_docs` table |
| Two-way messaging with the dietitian | ✅ | `MessageThread.tsx`, `/api/messages` |
| Submit a review (1–5 stars, one per patient) | ✅ | `ReviewForm.tsx`, `/api/reviews` |

## 4. Practice dashboard (`/admin`)

| Feature | Status | Notes |
|---|---|---|
| Stats: upcoming sessions, bookings, patients, revenue | ✅ | `src/app/admin/page.tsx` |
| Analytics: sessions + revenue bar charts (last 6 months) | ✅ | `BarChart.tsx` |
| Patient list + per-patient detail | ✅ | `AdminConsole.tsx` |
| Per-patient: health profile, progress chart, food journal, habit history | ✅ | Read-only views of patient data |
| Meal-plan builder (multi-day grid, notes) | ✅ | `MealPlanBuilder.tsx`, admin-only insert |
| Share diet plans / reports / notes | ✅ | `/api/docs` |
| Message any patient | ✅ | |
| Mark bookings paid / unpaid | ✅ | Patients cannot touch payment (server-enforced) |
| Review moderation (approve → publishes to website) | ✅ | `ReviewModeration.tsx` |

## 5. Auth & security

| Feature | Status | Notes |
|---|---|---|
| Supabase Auth (hashed passwords), server-side auto-confirm signup | ✅ | `createPatient` via service-role |
| Roles: patient / admin (dietitian) | ✅ | `profiles.role`; admin seeded via `scripts/seed-admin.mjs` |
| Row Level Security on every table | ✅ | Patients only see their own rows; `is_admin()` helper |
| Route guarding (`/dashboard`, `/admin`) + session refresh | ✅ | `src/proxy.ts` (matcher excludes `/api`!) |
| Secrets in `.env.local` (local) / Vercel env vars (prod) — never in git | ✅ | |

## 6. Infrastructure

| Feature | Status | Notes |
|---|---|---|
| Supabase Postgres (project `fxmvhcxbrubegqffjjcd`, ap-southeast-2) | ✅ | 11 tables, all RLS |
| Vercel hosting + GitHub auto-deploy (push to `main` = production) | ✅ | Project `nutricare`; ~2–3 min builds |
| Daily keep-alive cron (prevents free-tier DB auto-pause) | ✅ | `vercel.json` cron 03:00 UTC → `/api/keepalive` |
| Preview deployments on non-main branches / PRs | ✅ | Vercel default |

## 7. Planned / backlog

| Feature | Status | Notes |
|---|---|---|
| Razorpay online payments | 🔜 | `bookings.payment` already models paid/unpaid |
| Email notifications (booking confirmations, reminders) | 🔜 | Needs a Resend (or similar) account |
| Custom domain | 🔜 | e.g. `.com` ~$11/yr via Vercel |
| Video consultations (Zoom/Meet link per booking → built-in later) | 💤 | Deferred by scope decision |
| **Android app** (React Native, reusing this Supabase backend + API routes) | 🔜 | All APIs are mobile-ready JSON |
| Recipe library, wearable integrations, WhatsApp notifications | 💡 | Ideas from competitor research (Healthie / Practice Better / HealthifyMe) |

---

## Database tables (all with RLS)

`profiles` · `services` · `bookings` · `diet_docs` · `messages` · `progress_logs` · `intakes` · `meal_plans` · `food_logs` · `daily_habits` · `reviews`

## API routes

`/api/auth/{signup,login,logout}` · `/api/bookings` (+`/[id]` PATCH) · `/api/slots` · `/api/docs` · `/api/messages` · `/api/progress` · `/api/intake` · `/api/meal-plans` · `/api/food-logs` · `/api/habits` · `/api/reviews` · `/api/keepalive`

> **Keep this file updated** — when a feature ships, move it to the right section with ✅.
