# Demo Environment Guide

## Resetting

```bash
npm run supabase:start
npm run supabase:reset   # replays all migrations, then supabase/seed.sql
npm run dev
```

`db reset` wipes the local database and replays everything, so the demo
state is reproducible from zero at any time. `seed.sql` runs **only** on
local resets — the Supabase CLI never applies it to hosted projects.

## Seeded data

- 4 teams: IT Innovators, Data Wizard, Tech Pioneers, Cyber Knights
- 2 demo challenges: Welcome Flag (50 pts), Hidden Header (100 pts)
- 5 demo players, all password `ctf-demo-1234`:

| Alias    | Team          | Pre-solved    | Recovery code        |
| -------- | ------------- | ------------- | -------------------- |
| `sean`   | Cyber Knights | both          | `ACD-MNGK-AVCB-3XP3` |
| `chrmel` | Cyber Knights | both          | `ACD-M592-J8J7-XWFM` |
| `win`    | Data Wizard   | Hidden Header | `ACD-HTPV-EWGL-QT5L` |
| `dan`    | IT Innovators | Welcome Flag  | `ACD-FYMJ-C42W-HG4W` |
| `rapz`   | Tech Pioneers | Welcome Flag  | `ACD-S9HL-N2VK-YQUQ` |

Plus one teamless `ADMIN` for the admin area: `root` (no team, no
pre-solved challenges). Password: `ctf-demo-1234` (shared with demo
players). Recovery code: `ACD-ROOT-ADMIN-001`. Sign in as `root` to
exercise `/admin/*`; `root` cannot submit flags.

Submittable demo flags: `ACD{welcome_to_ctf}`, `ACD{hidden_header_demo}`.
Seeded challenges carry flag hashes only (flags are encrypted at rest since
migration 006); the admin edit form shows "Not available" until a flag is
re-saved, which stores it encrypted.

## Suggested walkthrough

1. Sign in as `rapz` → dashboard shows the flag module.
2. Submit `ACD{hidden_header_demo}` → success, +100 pts.
3. Resubmit it → duplicate guard message, no points.
4. Open leaderboard → Cyber Knights on top; activity → live solve rows.
5. Sign up a fresh alias → both flags accepted (solves are per-player).
6. Forgot-password with a demo recovery code → sessions revoked, fresh login.

## Before a real event

- Delete demo players, demo solves, and demo challenges (or start from a
  clean hosted project and run migrations only — seed never applies there).
  This includes the seeded `root` admin.
- Add real challenges through the admin UI (flags are hashed for scoring and
  encrypted at rest on save). `node scripts/hash-flag.mjs` remains available
  to verify a digest matches the app's hashing logic.
- Set a production `FLAG_ENCRYPTION_KEY` (`openssl rand -hex 32`, server-only
  env, never commit it) before creating real challenges.
- Promote organizers: `UPDATE players SET role = 'ADMIN' WHERE
lower(alias) = lower('myalias');`
- Rate limiting is enforced in-memory (`src/lib/security/rateLimit.ts`):
  correct for a single classroom server. Before any multi-instance or public
  event, swap the store for a shared provider (e.g. Redis) behind the same
  `checkAuthRateLimit` signature, and review CSRF hardening for
  cookie-authenticated writes.
