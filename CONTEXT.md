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

- Players (students): join with team name, full name, unique alias; no passwords.
- Admins (organizers): seed challenges/flags directly in SQL; remove demo rows
  before the real event. No admin UI in v1.

## Core Workflows

1. Join: team + full name + unique alias → persistent opaque HttpOnly session
   cookie (SHA-256 token hash stored in PostgreSQL) + one-time recovery code
   (only its SHA-256 hash stored, shown once).
2. Flag submission: global static flags, hashed (SHA-256) before DB lookup.
3. Duplicate-solve protection at DB layer: UNIQUE(player_id, challenge_id).
4. Leaderboards: team leaderboard, player leaderboard.
5. Personal activity page + simple profile page.

## Acceptance Criteria

- Join/login/recover works without passwords or Supabase Auth.
- Correct flag awards points exactly once per player per challenge.
- Wrong/duplicate submissions are rejected with safe errors.
- Leaderboards and activity reflect solves.
- Service-role key stays server-only (never NEXT*PUBLIC*\*).
- `npm run lint && npm run typecheck && npm test && npm run build` pass.

## Out of Scope

- Docker-hosted challenge instances (no per-challenge containers in v1).
- Passwords / Supabase Auth.
- Admin UI (SQL seeding only).
- Trusted rate limiting + CSRF hardening for cookie writes: required before any
  larger/public event (see README security notes).

## Generated Baseline

<!-- These values were selected during generation. Deviations require explicit approval. -->

- Architecture profile: medium
- Production baseline: generated default; deviations require approval.
- Authentication: not-yet
- Uploads: none
- Background jobs: none
- Offline behavior: none

## Product Decisions

- 2026-09-13 (user): v1 = static global flags only; auth = team + full name +
  unique alias with HttpOnly session cookie + one-time recovery code; admins
  seed flags via SQL (`node scripts/hash-flag.mjs`, store SHA-256 digest only).
- 2026-09-13 (user): leaderboards (team + player), personal activity, simple
  profile are in scope; Docker challenges and admin UI are out.

## Approved Deviations

<!-- Record date, approver, rationale, affected files, and recovery path. -->

- (none)

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
