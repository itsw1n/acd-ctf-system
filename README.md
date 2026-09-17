# ACD CTF

[![CI](https://github.com/itsw1n/acd-ctf-system/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/itsw1n/acd-ctf-system/actions)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Supabase Postgres 15](https://img.shields.io/badge/Supabase-Postgres_15-3ECF8E?logo=supabase&logoColor=white)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)
![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

School Capture The Flag platform — team signups, static flag submission, and
live leaderboards. Built with Next.js App Router, Tailwind CSS v4, Supabase
PostgreSQL, React Aria Components, and Lucide React.

## Quickstart

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` (local values work out of the box with the stack below),
then start everything:

```bash
npm run supabase:start
npm run supabase:reset   # migrations + demo seed
npm run dev
```

Open http://localhost:3000 and sign in with the [demo account](#demo-account).

Useful shortcuts: `make dev` (database + app), `make stop` (everything down),
`make help` (all targets). Full guide: [`docs/guides/setup.md`](docs/guides/setup.md).

## Demo accounts

Resetting the database (`npm run supabase:reset`) seeds five ready-made
players, one per row below. Shared password for all of them: `ctf-demo-1234`.

| Alias    | Team          | Solved                      | Points | Recovery code        |
| -------- | ------------- | --------------------------- | -----: | -------------------- |
| `sean`   | Cyber Knights | Welcome Flag, Hidden Header |    150 | `ACD-MNGK-AVCB-3XP3` |
| `chrmel` | Cyber Knights | Welcome Flag, Hidden Header |    150 | `ACD-M592-J8J7-XWFM` |
| `win`    | Data Wizard   | Hidden Header               |    100 | `ACD-HTPV-EWGL-QT5L` |
| `dan`    | IT Innovators | Welcome Flag                |     50 | `ACD-FYMJ-C42W-HG4W` |
| `rapz`   | Tech Pioneers | Welcome Flag                |     50 | `ACD-S9HL-N2VK-YQUQ` |

Cyber Knights tops both boards out of the box, so leaderboards and activity
render real data immediately.

Try the full loop right after reset (signed in as `rapz`):

| Step                             | Expect                                  |
| -------------------------------- | --------------------------------------- |
| Submit `ACD{hidden_header_demo}` | Success, +100 pts                       |
| Submit `ACD{welcome_to_ctf}`     | Duplicate — already solved              |
| Open leaderboard / activity      | Cyber Knights on top with live scores   |
| Sign up a fresh alias            | Both flags accepted (per-player solves) |

Seed source: [`supabase/seed.sql`](supabase/seed.sql) — local only, never runs
against hosted projects. **Remove demo rows before the real event.**

## Features

- Signup with team, full name, unique alias, and password (10–128 chars)
- Signin with alias + password (generic failures, no account enumeration)
- One-time recovery code (`ACD-XXXX-XXXX-XXXX`) for forgotten passwords only
- Forgot-password flow revokes all sessions and requires a fresh login
- Persistent HttpOnly browser session
- Global flag submission with duplicate-solve protection
- Team and player leaderboards, personal activity, profile with role display
- No Supabase Auth — custom password accounts on PostgreSQL only

How it fits together: [`docs/architecture/overview.md`](docs/architecture/overview.md) ·
Auth flows: [`docs/architecture/auth-flow.md`](docs/architecture/auth-flow.md) ·
Schema: [`docs/architecture/database-schema.md`](docs/architecture/database-schema.md)

## Environment

| Variable                               | Visibility      | Purpose                                                                                |
| -------------------------------------- | --------------- | -------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | client / public | Supabase project URL                                                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client / public | Public key; direct client DB access is disabled (no RLS policies — server-only access) |
| `SUPABASE_SERVICE_ROLE_KEY`            | server only     | Trusted server access — never `NEXT_PUBLIC_*`                                          |
| `SESSION_COOKIE_NAME`                  | server only     | Session cookie name (`acd_ctf_session`)                                                |

Details: [`docs/guides/env-variables.md`](docs/guides/env-variables.md).

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

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Then deploy to Vercel with the same environment variables. Production notes:
[`docs/guides/deployment.md`](docs/guides/deployment.md).

## UI

The visual system intentionally follows the approved industrial/classified-terminal direction:

- Oxanium headings, JetBrains Mono technical text
- void black background, deep charcoal surfaces
- burnt blood red primary, crimson active/danger accents
- toxic amber warnings, muted green success only
- clipped hard corners, thin rust borders
- restrained glow, scanlines, and grid texture
