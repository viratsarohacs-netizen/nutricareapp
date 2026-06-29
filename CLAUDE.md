@AGENTS.md

# NutriCare — Project Instructions

Personal SaaS web app for a **Certified Nutritionist & Clinical Dietitian** to run online
consultations: marketing site + online booking + patient portal + practice dashboard.

> **Isolation:** This is a personal project. It is independent of any work codebase — never
> pull in, reference, or commit work/Uzio code here, and never commit this project into a
> work repo. This folder (`C:\nutricare`) is the single source of truth.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind v4**
- Demo **file-backed data store** (`data/db.json`) + cookie session auth — runs with zero setup.
- The data layer is a deliberate seam for swapping to **Supabase** (Postgres + Auth + Storage).

## Run / build

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (also runs TypeScript typecheck)
npm run lint
```

## Architecture (where things live)

| Concern | File |
|---|---|
| **Branding & config** (name, services, prices, hours) — edit here to rebrand everything | `src/lib/config.ts` |
| Domain types | `src/lib/types.ts` |
| **Data layer** — the ONLY place that touches storage; swap point for Supabase | `src/lib/store.ts` |
| Cookie session helpers | `src/lib/session.ts` |
| Availability + date/money formatters (client-safe — must NOT import `store.ts`) | `src/lib/slots.ts` |
| Pages | `src/app/{page,book,login,signup,dashboard,admin}` |
| API route handlers | `src/app/api/{auth,bookings,slots,docs,messages}` |
| UI components | `src/components/` |

## Conventions / gotchas

- **Client/server boundary:** `store.ts` uses Node `fs` — it must never be imported by a
  client component. Keep pure formatters in `slots.ts` (client-safe); keep anything reading
  the store in route handlers or server components.
- **All app reads go through `store.ts` functions** — never read/write `data/db.json` directly
  from a page or component. This keeps the Supabase migration to a single file.
- **Branding is data-driven** — pull copy/services from `config.ts`, don't hardcode in JSX.
- `data/` is gitignored (demo state). Deleting `data/db.json` re-seeds clean demo data on next start.

## Demo accounts

- Patient — `patient@demo.com` / `demo123`
- Nutritionist (admin) — `anya@anyasharma.health` / `admin123`

## Roadmap (deferred by scope)

1. Real **Supabase** (replace function bodies in `store.ts` + `session.ts`).
2. Real **payments** (Stripe / Razorpay) — currently a mock checkout in `BookingFlow.tsx`.
3. **Video** consults — add per-booking Zoom/Meet link or a built-in provider.
4. Email confirmations; deploy to **Vercel**.
