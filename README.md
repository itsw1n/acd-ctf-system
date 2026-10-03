# ACD CTF

[![CI](https://github.com/itsw1n/acd-ctf-system/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/itsw1n/acd-ctf-system/actions)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Supabase Postgres 15](https://img.shields.io/badge/Supabase-Postgres_15-3ECF8E?logo=supabase&logoColor=white)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)
![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

School Capture The Flag platform where **anyone can host a competition room**
and anyone can join one. Built with Next.js App Router, Tailwind CSS v4,
Supabase PostgreSQL, React Aria Components, and Lucide React.

## How it works

Every competition lives in a **room**: its own challenges, teams, members,
solves, and leaderboard. There is no site-wide admin — authority is per room.

| Role            | Can do                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| Room **owner**  | Create the room, add challenges and teams, manage members, lock players, regenerate the join code, delete the room |
| **Participant** | Join via public listing or join code, pick a team, solve challenges, climb the room leaderboard                    |

- Rooms are **public** (listed, anyone can join) or **private** (join code `RM-XXXXXX` only, regenerable, joining can be locked).
- Challenges are `TEXT` or `EXTERNAL` (one Drive/hosted link), each with an author, category, difficulty, and points.
- Flags are static per room: SHA-256 hashed for submissions, AES-256-GCM encrypted at rest.
- Locking a player freezes them in place (team and score kept) until unlocked — nothing is deleted.

How it fits together: [`docs/architecture/overview.md`](docs/architecture/overview.md) ·
Auth flows: [`docs/architecture/auth-flow.md`](docs/architecture/auth-flow.md) ·
Schema: [`docs/architecture/database-schema.md`](docs/architecture/database-schema.md)

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

Open http://localhost:3000 and sign in with the [demo account](#demo-accounts).

Useful shortcuts: `make dev` (database + app), `make stop` (everything down),
`make help` (all targets). Full guide: [`docs/guides/setup.md`](docs/guides/setup.md).

## Demo accounts

Resetting the database (`npm run supabase:reset`) seeds five ready-made
players in the default `acd-ctf` room. Shared password for all of them: `ctf-demo-1234`.

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

**Accounts** (no Supabase Auth — custom password accounts on PostgreSQL only)

- Signup with alias, full name, and password (10–128 chars)
- Signin with alias + password (generic failures, no account enumeration)
- One-time recovery code (`ACD-XXXX-XXXX-XXXX`) for forgotten passwords only
- Password reset revokes all sessions and requires a fresh login
- Persistent opaque HttpOnly browser session

**Rooms**

- Create public or private rooms; join with a code or straight from Browse
- Per-room teams, challenges, members, solves, and leaderboards
- Regenerable join codes, room-wide join lock, per-player lock/unlock
- Typed-confirmation room delete (default room is protected)
- Owners manage instead of playing — no flag submission in your own room

**Challenges & scoring**

- `TEXT` and `EXTERNAL` challenges with authors, filters, and one resource link
- Correct flag awards points exactly once per player per challenge
- Wrong/duplicate submissions rejected with safe errors
- Team and player leaderboards plus personal solve history, per room

## Environment

| Variable                               | Visibility      | Purpose                                                                                |
| -------------------------------------- | --------------- | -------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | client / public | Supabase project URL                                                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client / public | Public key; direct client DB access is disabled (no RLS policies — server-only access) |
| `SUPABASE_SERVICE_ROLE_KEY`            | server only     | Trusted server access — never `NEXT_PUBLIC_*`                                          |
| `SESSION_COOKIE_NAME`                  | server only     | Session cookie name (`acd_ctf_session`)                                                |
| `FLAG_ENCRYPTION_KEY`                  | server only     | 32-byte hex key for challenge flag encryption (`openssl rand -hex 32`)                 |

Details: [`docs/guides/env-variables.md`](docs/guides/env-variables.md).

## Add a real flag

Generate its hash locally:

```bash
node scripts/hash-flag.mjs "ACD{your_secret_flag}"
```

Insert only the resulting SHA-256 digest into `challenges.flag_hash`.

## Security notes

- Player identity is an opaque random HttpOnly cookie; only a SHA-256
  token hash is stored in PostgreSQL.
- Passwords are Argon2id hashes (never SHA-256, never plaintext) verified
  server-side only; unknown aliases run a dummy verification so signin
  timing reveals nothing.
- Recovery codes are shown once; only their SHA-256 hashes are stored.
  Codes reset forgotten passwords only — they never restore sessions directly.
- Password resets revoke ALL sessions for the player.
- Room authority (`OWNER`/`PARTICIPANT`) is enforced server-side per room;
  public signup creates plain accounts with no privileges.
- Flag values are hashed before database lookup; recoverable copies are
  AES-256-GCM encrypted and decrypted server-side for the admin edit form only.
- `UNIQUE(player_id, challenge_id)` (per room) prevents duplicate scoring
  at the database layer.
- Service-role credentials remain server-only.
- Auth/flag rate limiting is in-memory single-instance: fine for a classroom
  on one server; a shared provider (e.g. Redis) is required before any
  multi-instance or public event, plus CSRF hardening for cookie writes.

## Validation

```bash
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
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
- skeleton placeholders for page loads, animated dots for button pending states
