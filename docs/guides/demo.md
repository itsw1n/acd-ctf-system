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

Everything below belongs to the default room (`slug: acd-ctf`):

- 4 teams: IT Innovators, Data Wizard, Tech Pioneers, Cyber Knights
- 2 demo challenges: Welcome Flag (50 pts), Hidden Header (100 pts), both by `ACD Team`
- 6 demo accounts, all password `ctf-demo-1234`:

| Alias    | Membership      | Pre-solved    | Recovery code        |
| -------- | --------------- | ------------- | -------------------- |
| `sean`   | Cyber Knights   | both          | `ACD-MNGK-AVCB-3XP3` |
| `chrmel` | Cyber Knights   | both          | `ACD-M592-J8J7-XWFM` |
| `win`    | Data Wizard     | Hidden Header | `ACD-HTPV-EWGL-QT5L` |
| `dan`    | IT Innovators   | Welcome Flag  | `ACD-FYMJ-C42W-HG4W` |
| `rapz`   | Tech Pioneers   | Welcome Flag  | `ACD-S9HL-N2VK-YQUQ` |
| `root`   | OWNER (no team) | —             | `ACD-ROOT-ADMIN-001` |

Accounts carry no team or role; membership rows hold them. Sign in as
`root` to exercise `/rooms/acd-ctf/admin/*`; `root` cannot submit flags in
its own room.

Submittable demo flags: `ACD{welcome_to_ctf}`, `ACD{hidden_header_demo}`.
Seeded challenges carry flag hashes only (flags are encrypted at rest since
migration 006); the admin edit form shows "Not available" until a flag is
re-saved, which stores it encrypted.

## Suggested walkthrough

1. Sign in as `rapz` → `/rooms` lists the default room; open it.
2. Play → submit `ACD{hidden_header_demo}` → success, +100 pts.
3. Resubmit it → duplicate guard message, no points.
4. Room overview → Cyber Knights on top; activity → live solve rows.
5. Create a room as a fresh alias → you become its owner; join it from a
   second account with the room code.
6. Forgot-password with a demo recovery code → sessions revoked, fresh login.
7. Sign in as `root` → room admin shows team/player leaderboards; ban or lock
   a member to verify per-room access controls.

## Before a real event

- Delete demo data (or start from a clean hosted project and run migrations
  only — seed never applies there). This includes the seeded `root` owner.
- Add real challenges through a room's admin UI (flags are hashed for scoring
  and encrypted at rest on save; each challenge has an author and one optional
  external Drive or hosted-resource link). `node scripts/hash-flag.mjs` remains available
  to verify a digest matches the app's hashing logic.
- Set a production `FLAG_ENCRYPTION_KEY` (`openssl rand -hex 32`, server-only
  env, never commit it) before creating real challenges.
- Authority is per room: whoever creates a room owns it. There is no global
  admin role to assign.
- Rate limiting is enforced in-memory (`src/lib/security/rateLimit.ts`):
  correct for a single classroom server. Before any multi-instance or public
  event, swap the store for a shared provider (e.g. Redis) behind the same
  `checkAuthRateLimit` signature, and review CSRF hardening for
  cookie-authenticated writes.
