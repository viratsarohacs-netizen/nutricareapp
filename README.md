# NutriCare — Online Nutrition Consultation SaaS

A live SaaS web app for **Dt. Pragya Choudhary** (clinical dietitian) to run her practice
online: a marketing site, online booking, a patient portal (diet plans, documents,
messaging), and a practice dashboard for the nutritionist.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4** and
**Supabase** (Postgres + Auth, with Row Level Security).

> **Backend is live on Supabase.** Real auth (signups auto-confirmed server-side), Postgres
> with RLS so patients only ever see their own data. Config in `.env.local` (gitignored).
> Payments are deferred — bookings are created `unpaid` and the nutritionist marks them paid
> in the dashboard (Razorpay can be added later).

## Run it

```bash
npm install          # if node_modules isn't present
npm run dev          # http://localhost:3000
```

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
and `SUPABASE_SERVICE_ROLE_KEY`.

## Accounts

- **Nutritionist (admin):** `dieticianpragya@gmail.com` — seed/reset the password with
  `node scripts/seed-admin.mjs [password]`.
- **Patients:** self-serve — anyone can sign up, or create an account inline while booking.

## What's included

- **Landing page** (`/`) — hero, services & pricing, how-it-works, testimonials, CTAs.
- **Booking flow** (`/book`) — 4 steps: choose service → pick date/time (live availability)
  → your details (creates an account) → mock payment → confirmation.
- **Patient portal** (`/dashboard`) — upcoming/past appointments, diet plans & documents,
  two-way messaging with the nutritionist.
- **Practice dashboard** (`/admin`) — stats, upcoming schedule, patient list, share diet
  plans/notes, and message any patient.
- **Auth** — signup/login/logout with an httpOnly session cookie.

## Project structure

```
src/
  lib/
    config.ts     # <- EDIT to rebrand: name, credential, services, availability
    types.ts      # domain types
    store.ts      # data layer (the Supabase swap point) + seed data
    session.ts    # cookie session helpers
    slots.ts      # availability + date/money formatters (client-safe)
  app/
    page.tsx              # landing
    book/                 # booking flow
    login/  signup/       # auth pages
    dashboard/            # patient portal
    admin/                # nutritionist dashboard
    api/                  # auth, bookings, slots, docs, messages route handlers
  components/             # SiteHeader, BookingFlow, AuthForm, MessageThread, AdminConsole
```

## Rebranding

Open `src/lib/config.ts` and edit the `practice` object — name, credentials, tagline,
services & prices, working hours. Everything on the site reads from there.

## Going to production

1. **Supabase** — replace the function bodies in `src/lib/store.ts` with Supabase queries
   and use Supabase Auth in `src/lib/session.ts`. The rest of the app only calls those
   helpers, so nothing else changes.
2. **Payments** — swap `MockPayment` in `BookingFlow.tsx` and the booking route for Stripe
   Checkout / Razorpay; set `payment` based on the real webhook.
3. **Video** — deferred for now (per scope). Add a Zoom/Google Meet link per booking, or a
   built-in provider (Daily/Twilio) later.
4. **Email** — wire confirmations (Resend/SendGrid) where the confirmation step is shown.
5. Deploy to **Vercel**.
