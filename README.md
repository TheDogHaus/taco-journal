# Taco Journal 🌮

A warm, playful, mobile-first journal for the tacos you never want to forget.
Front end only for now (React + Vite + TypeScript + Tailwind v4); data is stored
in the browser. Supabase comes later.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
npm run lint
```

On the empty Journal screen, tap **Try it with sample tacos** to see it populated.

## How it works

- **Quick capture** (`/capture`, the red + button): photo + restaurant + reaction,
  optional taco chips and a one-liner. Saved as `status: 'quick'` and shown in
  "To finish" on the Journal.
- **Full entry** (`/visit/new`, `/visit/:id/edit`): rating (half stars), would-return,
  dishes, mood, occasion, who with, salsa heat, price, notes, favorite.
- Minimum for any entry (quick bite or full entry): **restaurant and reaction**. Photos
  are optional, up to 3 per visit.
- Search with filters, restaurant pages, and an Insights screen.

## Connecting Supabase

Without Supabase settings the app runs in **demo mode** (data and accounts stay in
the browser). To use a real backend:

1. In the Supabase dashboard open **SQL Editor**, paste in
   `supabase/migrations/20261113000000_initial_schema.sql`, and run it. It creates
   the tables, per-user security rules and the private `food-photos` bucket.
2. Copy `.env.example` to `.env.local` and fill in your project URL and the
   **publishable** key (Project Settings -> API Keys). Never use the secret key.
3. In **Authentication -> URL Configuration** set the Site URL to
   `http://localhost:5173` and add `http://localhost:5173/reset-password` to the
   Redirect URLs (add your real domain too once deployed).
4. Optional: switch off **Confirm email** under Authentication -> Sign In / Providers
   -> Email so new accounts can sign in immediately.
5. Restart `npm run dev`.

## Where the Supabase swap happens (already done)

All data access goes through the `JournalRepository` interface in
`src/data/repository.ts`. Today it is implemented by `src/data/localRepository.ts`
(localStorage for entries, IndexedDB for photos). To move to Supabase, write a
second implementation of that interface and change the one line in
`src/data/index.ts`. Types in `src/data/types.ts` mirror the planned tables.

Accounts work the same way: the UI only talks to the `AuthService` interface in
`src/auth/authService.ts`. The current implementation is a local demo (accounts
are stored in the browser, passwords are not stored or checked). To move to
Supabase Auth, write a second implementation and change `src/auth/index.ts`.

```
src/
  auth/            AuthService interface, demo implementation, context, validation
  components/      shared UI (stars, photo picker, nav, …)
  data/            types, repository interface, local implementation, hooks, sample data
  features/        capture, visits, restaurants, search, insights, me
  lib/             constants, dates, stats, search, image compression
```
