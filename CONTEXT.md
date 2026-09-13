# CONTEXT.md

## Project

**Name:** acd-ctf-system
**Description:** ctf system for school competition
**Stack:** nextjs-supabase
**Styling:** TAILWIND
**Compatibility profile:** 2026.09
**Year:** 2026
**Product status:** active

## Product Goals

School Capture The Flag competition platform: students join with a team, submit
static flags, and compete on team and player leaderboards. Confirmed 2026-09-13
from README direction (user-approved onboarding).

## Users

- Players (students): sign up with team name, full name, unique alias, and
  password; sign in with alias + password.
- Admins (organizers): manage challenges/teams and review players/solves via
  `/admin/*` (guarded by `requireAdmin()`); accounts are promoted manually in
  Supabase. No Docker/hosting controls.

## Core Workflows

1. Signup: team + full name + unique alias + password (10–128 chars) →
   Argon2id hash stored; recovery code (`ACD-XXXX-XXXX-XXXX`, hash stored)
   shown ONCE behind an explicit continue gate; first session issued only
   after the gate.
2. Signin: alias + password → generic failures, persistent opaque HttpOnly
   session cookie (SHA-256 token hash stored in PostgreSQL).
3. Forgot password: alias + recovery code re-verified statelessly →
   new Argon2id hash, ALL sessions revoked, fresh login required.
4. Flag submission: global static flags, hashed (SHA-256) before DB lookup.
5. Duplicate-solve protection at DB layer: UNIQUE(player_id, challenge_id).
6. Leaderboards: team leaderboard, player leaderboard.
7. Personal activity page + simple profile page (shows role + session status).

## Acceptance Criteria

- Signup/signin/forgot-password work with alias + Argon2id password; no
  Supabase Auth (PostgreSQL only).
- Recovery codes are shown once and reset passwords only.
- Correct flag awards points exactly once per player per challenge.
- Wrong/duplicate submissions are rejected with safe errors.
- Leaderboards and activity reflect solves.
- Service-role key stays server-only (never NEXT*PUBLIC*\*).
- Admin pages/mutations require ADMIN via `requireAdmin()`; signup never
  accepts a role and always creates PLAYER.
- Challenge flags are SHA-256 hashed server-side; plaintext is never stored
  or returned; blank edit flag keeps the current hash.
- `npm run lint && npm run typecheck && npm test && npm run build` pass.

## Out of Scope

- Docker-hosted challenge instances (no per-challenge containers).
- Supabase Auth.
- Admin promotion/demotion UI, event start/stop, manual score adjustment,
  solve deletion, unsafe team deletion.
- Enforced rate limiting + CSRF hardening for cookie writes: required before any
  larger/public event (boundary hook exists, provider not yet integrated).

## Generated Baseline

<!-- These values were selected during generation. Deviations require explicit approval. -->

- Architecture profile: medium
- Production baseline: generated default; deviations require approval.
- Authentication: custom password accounts (deviation approved 2026-09-13; was not-yet)
- Uploads: none
- Background jobs: none
- Offline behavior: none

## Product Decisions

- 2026-09-13 (user): v1 = static global flags only; auth = team + full name +
  unique alias with HttpOnly session cookie + one-time recovery code; admins
  seed flags via SQL (`node scripts/hash-flag.mjs`, store SHA-256 digest only).
- 2026-09-13 (user): leaderboards (team + player), personal activity, simple
  profile are in scope; Docker challenges are out.
- 2026-09-13 (user): admin area (`/admin/*`: overview, players, teams,
  challenges, solves) is in scope; challenge management is the primary
  feature with server-hashed flags and strict TEXT/FILE/EXTERNAL URL rules.

## Approved Deviations

- 2026-09-13 (approver: user/spec author): password accounts replace the
  passwordless join model. Rationale: usable signin without keeping recovery
  codes at hand; codes remain for password reset only. Files:
  `supabase/migrations/002_account_auth.sql`, `src/features/auth/**`,
  `src/lib/security/*`, `src/app/{signin,signup,forgot-password}/**`.
  Recovery: passwords are Argon2id hashes (irreversible); rollback = restore
  pre-002 database backup, which drops password_hash/role/last_seen_at.
- 2026-09-13 (approver: user/spec author): admin UI replaces SQL-only
  challenge seeding. Rationale: organizers need operational challenge/team
  management without production SQL. Files: `supabase/migrations/003_admin_challenges.sql`,
  `src/features/admin/**`, `src/features/challenges/**`, `src/app/(ctf)/admin/**`.
  Scope stays static flags only; no hosting/lifecycle controls.

## Notes

- Starter baseline (`StarterStatus`, example migration) is not the product; keep
  reusable infra and replace starter behavior incrementally with tested CTF
  behavior (Starter Transition).
- Local Supabase tweaks (not production): `supabase/config.toml` uses
  `project_id = "acd-ctf-system"`, `db.major_version = 15` (CLI 2.116 rejects
  16), ports shifted to 55421/55422/55423 because a sibling `nextjs-supabase`
  stack occupies 54322 on this machine. Revisit if the CLI gains PG16 support.
- `.env.local` points at the local stack; never commit real credentials.

## Expected Concerns (advisory)

- validation
- query
- state
- env
- url-state
- safe-action
