# ACD CTF

Basic school Capture The Flag platform built with Next.js App Router, Tailwind CSS v4, Supabase PostgreSQL, React Aria Components, and Lucide React.

## Current scope

- Join with team, full name, and unique alias
- One-time recovery code
- Persistent HttpOnly browser session
- Global flag submission
- Duplicate-solve protection
- Team leaderboard
- Player leaderboard
- Personal activity page
- Simple profile page
- No passwords / no Supabase Auth
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
- Recovery codes are shown once; only their SHA-256 hashes are stored.
- Flag values are hashed before database lookup.
- `UNIQUE(player_id, challenge_id)` prevents duplicate scoring at the database layer.
- Service-role credentials remain server-only.
- For a larger/public event, add trusted rate limiting and CSRF hardening for cookie-authenticated writes before launch.

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
