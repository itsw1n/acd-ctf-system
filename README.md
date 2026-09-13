# ACD CTF

Basic school Capture The Flag platform built with Next.js App Router, Tailwind CSS v4, Supabase PostgreSQL, React Aria Components, and Lucide React.

## Current scope

- Signup with team, full name, unique alias, and password (10–128 chars)
- Signin with alias + password (generic failures, no account enumeration)
- One-time recovery code (`ACD-XXXX-XXXX-XXXX`) for forgotten passwords only
- Forgot-password flow revokes all sessions and requires a fresh login
- Persistent HttpOnly browser session
- Global flag submission
- Duplicate-solve protection
- Team leaderboard
- Player leaderboard
- Personal activity page
- Simple profile page with role display
- No Supabase Auth (custom password accounts on PostgreSQL only)
- No Docker-hosted challenges yet

## 1. Install

```bash
npm install
```

## 2. Create Supabase project

Open Supabase SQL Editor and run:

```text
supabase/migrations/001_initial_schema.sql
```

The migration enables RLS and removes anon/authenticated table access. This MVP intentionally accesses the database only from trusted Next.js server code with the service-role key.

## 3. Environment

Copy:

```bash
cp .env.example .env.local
```

Set:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SESSION_COOKIE_NAME=acd_ctf_session
```

Never expose the service-role key through `NEXT_PUBLIC_*`.

## 4. Run

```bash
npm run dev
```

Open http://localhost:3000.

## Demo flags

The migration seeds two demo challenge hashes for development:

```text
ACD{welcome_to_ctf}
ACD{hidden_header_demo}
```

Remove those challenge rows before the real event.

## Add a real flag

Generate its hash locally:

```bash
node scripts/hash-flag.mjs "ACD{your_secret_flag}"
```

Insert only the resulting SHA-256 digest into `challenges.flag_hash`.

## Security notes

- Player identity is represented by an opaque random HttpOnly cookie.
- Only a SHA-256 session-token hash is stored in PostgreSQL.
- Passwords are hashed with Argon2id (never SHA-256, never plaintext) and
  verified server-side only; unknown aliases run a dummy verification so
  signin timing reveals nothing.
- Recovery codes are shown once; only their SHA-256 hashes are stored.
  Codes reset forgotten passwords only — they never restore sessions directly.
- Password resets revoke ALL sessions for the player.
- Roles (`PLAYER`/`ADMIN`) are forced server-side; public signup always creates
  `PLAYER`. Promote manually: `UPDATE players SET role = 'ADMIN' WHERE
  lower(alias) = lower('myalias');`
- Flag values are hashed before database lookup.
- `UNIQUE(player_id, challenge_id)` prevents duplicate scoring at the database layer.
- Service-role credentials remain server-only.
- Auth actions call a rate-limit boundary (`checkAuthRateLimit`) that is
  currently a documented no-op. Before any larger/public event, integrate a
  production-compatible provider (e.g. Upstash Redis on Vercel) plus CSRF
  hardening for cookie-authenticated writes.

## Production checklist

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Then deploy to Vercel with the same environment variables.

## UI

The visual system intentionally follows the approved industrial/classified-terminal direction:

- void black background
- deep charcoal surfaces
- burnt blood red primary
- crimson active/danger accents
- toxic amber warnings
- muted green success only
- clipped hard corners
- thin rust borders
- restrained glow, scanlines, and grid texture
