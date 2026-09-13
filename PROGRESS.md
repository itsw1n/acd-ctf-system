# PROGRESS.md

## Status
🟢 Baseline running — CTF build not started

---

## Completed
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
