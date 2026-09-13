# Demo Environment Guide

## Resetting

```bash
npm run supabase:start
npm run supabase:reset   # migrations 001 + 002, then supabase/seed.sql
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

Submittable demo flags: `ACD{welcome_to_ctf}`, `ACD{hidden_header_demo}`.

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
- Add real challenges with `node scripts/hash-flag.mjs` (store digests only).
- Promote organizers: `UPDATE players SET role = 'ADMIN' WHERE
lower(alias) = lower('myalias');`
- Integrate the rate-limit provider (see `src/lib/security/rateLimit.ts`)
  and review CSRF hardening for cookie-authenticated writes.
