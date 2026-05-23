# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

### Worker App (root)
```bash
npm run dev      # Start dev server → http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

### Employer App (employer-app/)
```bash
cd employer-app
npm run dev      # Start dev server → http://localhost:3001
npm run build    # Production build
npm run lint     # ESLint
```

No test suite configured yet.

## Environment Variables

**Local Development (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
```
Local Supabase runs via Docker at `/home/user/supabase/`. Start: `cd /home/user/supabase && docker compose up -d`

**Production (Vercel env vars):**
```
NEXT_PUBLIC_SUPABASE_URL=https://apytwhemutebpokzkpis.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production anon key>
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first config via `@import "tailwindcss"`)
- **Backend:** Supabase (Auth, DB, Storage)
- **Deploy:** Vercel → https://easy-maid-feb.vercel.app
- **UI Language:** Traditional Chinese (zh-TW)

## Architecture

Dual-App monorepo — two independent Next.js apps sharing one Supabase project.

### Worker App (`src/`, port 3000)
Target user: Foreign domestic helpers (外傭)

Routes:
- `/` — Landing page
- `/signin` — Login (email, Google, Facebook)
- `/signup` — Registration
- `/profile` — User profile + phone verification
- `/feed` — Activity feed
- `/workers` — Worker listing
- `/worker/register` — 8-step registration wizard
- `/worker/edit` — Edit worker profile
- `/worker/success` — Registration success
- `/test-sms` — SMS debug utility

### Employer App (`employer-app/src/`, port 3001)
Target user: Employers (僱主)

Routes:
- `/` — Landing page
- `/signin` — Login
- `/signup` — Registration
- `/profile` — User profile
- `/feed` — Activity feed
- `/workers` — Worker listing
- `/workers/[id]` — Worker detail
- `/bookmarks` — Saved workers

Components: `components/BottomTabBar.tsx`

### Shared
- **Supabase project:** `apytwhemutebpokzkpis` (Tokyo region)
- **Path alias:** `@/*` → `./src/*` (both apps)

## Tailwind CSS v4 Notes

- No `tailwind.config.ts` — v4 uses CSS-first configuration
- Import: `@import "tailwindcss"` in `globals.css`
- PostCSS: `postcss.config.mjs` with `@tailwindcss/postcss` plugin
- Custom colors/shadows are CSS variables in `:root` (see `globals.css`)
- Custom utility classes (`.btn-primary`, `.card-airbnb`, etc.) in `globals.css`

## Auth System

Supabase handles all auth. Client instance in `src/lib/supabase.ts`.

Methods:
- Email/password (`signInWithPassword`, `signUp`)
- Google OAuth (`signInWithOAuth({ provider: 'google' })`)
- Facebook OAuth (`signInWithOAuth({ provider: 'facebook' })`)
- Phone/SMS OTP via Twilio (`signInWithOtp` + `verifyOtp`)

Auth guard: client-side check on mount (`supabase.auth.getUser()`). No middleware-based route protection yet.

OAuth redirect: `${window.location.origin}/profile` — add to Supabase dashboard Redirect URLs.

## Development Progress

- **Phase 0** ✅ Auth + Worker registration + Feed
- **Phase 1** ✅ Worker public listing + Tab navigation
- **Phase 2** ⬜ Role system (user_roles, employer registration)
- **Phase 3** ⬜ Inquiry system
- **Phase 4** ⬜ Bookmark system
- **Phase 5** ✅ Admin panel (route guard, worker list, detail, approve/reject, status change)
- **Phase 6** ⬜ UX improvements

See `doc/SYSTEM_PLAN.md` for full roadmap.
