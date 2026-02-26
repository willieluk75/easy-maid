# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Worker App (root)
```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
```

### Employer App (employer-app/)
```bash
cd employer-app
npm run dev      # Start development server (http://localhost:3001)
npm run build    # Build for production
npm run lint     # Run ESLint
```

No test suite is configured yet.

## Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture

**Stack:** Next.js 15/16 (App Router), TypeScript, Tailwind CSS, Supabase

**Dual-App Setup:** Same repo, two independent Next.js apps.
- Worker App: `src/` (root), port 3000
- Employer App: `employer-app/src/`, port 3001
- Shared Supabase project: `apytwhemutebpokzkpis` (Tokyo)

**Path alias:** `@/*` → `./src/*` (both apps)

**UI language:** Traditional Chinese (zh-TW)

### Auth System

All authentication is handled via Supabase. The single client instance lives in `src/lib/supabase.ts` and is imported directly in client components.

Auth methods supported:
- Email/password (`signInWithPassword`, `signUp`)
- Google OAuth (`signInWithOAuth({ provider: 'google' })`)
- Facebook OAuth (`signInWithOAuth({ provider: 'facebook' })`) — requires Facebook App setup (see `FACEBOOK_LOGIN_SETUP.md`)
- Phone/SMS OTP via Twilio (`signInWithOtp({ phone })` + `verifyOtp`) — requires Twilio configured in Supabase (see `PHONE_AUTH_SETUP.md`)

### Page Flow

- `/` — Landing page with links to sign in/up and SMS test
- `/signin` — Email + Google + Facebook login; redirects to `/profile` on success
- `/signup` — Email + Google + Facebook registration; redirects to `/profile` on success
- `/profile` — Protected page; redirects to `/signin` if unauthenticated. Shows user info and phone number verification flow (send OTP → enter 6-digit code → verified).
- `/test-sms` — Debug utility for testing Supabase phone auth / Twilio SMS delivery

### Auth Guard Pattern

`/profile` uses a client-side auth check on mount (`supabase.auth.getUser()`). There is no middleware-based route protection yet.

### OAuth Redirect

Both sign-in and sign-up OAuth flows use `redirectTo: \`${window.location.origin}/profile\`` so the Supabase dashboard must have `http://localhost:3000/profile` (dev) and the production URL listed under **Authentication → URL Configuration → Redirect URLs**.
