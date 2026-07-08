# NutriCare — Online Nutrition Consultation SaaS

A live SaaS web app for **Dt. Pragya Choudhary** (clinical dietitian) to run her practice
online: marketing site, online booking, a full patient portal (progress tracking, meal
plans, food journal, habits, messaging), and a practice dashboard for the dietitian.

**Live:** https://nutricare-ten.vercel.app

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4** and
**Supabase** (Postgres + Auth, Row Level Security on every table).

> 📋 **Full feature list → [FEATURES.md](FEATURES.md)** — the tracked registry of every
> shipped and planned feature. Keep it updated when features ship.

## Run locally

```bash
npm install          # if node_modules isn't present
npm run dev          # http://localhost:3000
```

Requires `.env.local` (gitignored) with `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

## Deploy

Push to `main` → GitHub-connected Vercel auto-deploys to production (~2–3 min).
Preview deployments are created for other branches/PRs. Env vars live in Vercel
project settings. A daily cron (`vercel.json` → `/api/keepalive`) keeps the
free-tier Supabase database from auto-pausing.

## Accounts

- **Nutritionist (admin):** `dieticianpragya@gmail.com` — seed/reset the password with
  `node scripts/seed-admin.mjs [password]`.
- **Patients:** self-serve — sign up directly, or an account is created inline while booking.

## Project structure

```
src/
  lib/
    config.ts        # <- EDIT to rebrand: name, tagline, availability, currency, hero photo
    types.ts         # domain types
    store.ts         # data layer — ALL Supabase queries live here
    session.ts       # auth session helpers (Supabase Auth)
    slots.ts         # availability + date/money formatters (client-safe)
    supabase/        # server (RLS) + admin (service-role) clients
  proxy.ts           # session refresh + /dashboard & /admin guard (matcher excludes /api)
  app/
    page.tsx               # landing (BMI calc, conditions, FAQ, real reviews)
    book/                  # booking flow
    login/  signup/        # auth pages
    dashboard/             # patient portal
    admin/                 # practice dashboard
    api/                   # route handlers (see FEATURES.md for the full list)
  components/              # UI components (charts are dependency-free SVG)
scripts/seed-admin.mjs     # seed/reset the admin login
vercel.json                # keep-alive cron
```

## Conventions

- **All data access goes through `src/lib/store.ts`** — components/routes never query
  Supabase directly. This keeps the future Android app + any backend swap trivial.
- **RLS is the security boundary** — patients can only ever read/write their own rows;
  `is_admin()` grants the dietitian full access. Route handlers add role checks on top.
- **Never commit secrets** — `.env.local` and `.vercel/` are gitignored.
- Services/prices are **data** (Supabase `services` table), not code.

## Roadmap

See the **Planned / backlog** section in [FEATURES.md](FEATURES.md) — next up:
Razorpay payments, email notifications, custom domain, Android app.
