# PROGRESS.md

## Status

🟢 CTF implementation merged to main — live on dev server

---

## Completed

- 2026-09-13: Copied real CTF implementation from `../acd-ctf` (join, sessions,
  flags, leaderboards, activity, profile, schema 001) onto this project's
  baseline; added missing `server-only` dep + vitest stub; replaced stale
  starter tests/e2e; removed example migration.
- 2026-09-13: Merged via PR relay on branch `feature/ctf-implementation`
  (13 commits) → `dev` (PR #1) → `main` (PR #2). Remote:
  `github.com/itsw1n/acd-ctf-system`.
- 2026-09-13: `main` branch protection on — direct pushes rejected (GH006),
  PR + 1 approval + resolved conversations required, enforced for admins.
  Required status checks NOT yet set (repo has no Supabase secrets, so CI
  build cannot pass until hosted Supabase is wired).
- 2026-09-13: Project setup — upgraded npm 10.9.8 → 11.19.0 (project requires
  ≥11.19.0; old npm crashed with `edgesOut` error), `npm install` (476 pkgs),
  created `.env.local`, fixed `supabase/config.toml` (project_id, PG15, ports
  55421/2/3), `supabase start` + `db reset` OK.
- 2026-09-13: Validation green — `lint`, `typecheck`, `test` (2 passed),
  `build`, dev server 200 on `/` and `/api/health`.
- 2026-09-13: Product onboarding confirmed (static flags, cookie+recovery auth,
  SQL seeding, leaderboards/activity/profile in scope); CONTEXT.md → active.

## In Progress

- CTF schema + join/session/flag/leaderboard implementation (starter still in place).

## Up Next

1. Design CTF tables (teams, players, sessions, challenges, solves) + RLS/service-role access.
2. Join + session + recovery-code flow with tests.
3. Flag submission with hash lookup + duplicate protection + tests.
4. Leaderboards, activity, profile pages.
5. Replace starter tests/E2E with CTF behavior tests.

## Blocked

- (none)

## Decisions Made

- 2026-09-13: Local Supabase on ports 55421/55422/55423 + PG15 (sibling stack
  conflict + CLI limitation); dev server on :3000.
