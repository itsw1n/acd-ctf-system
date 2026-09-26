# PROGRESS.md

## Status

🟡 CTF feature branch ready for PR review — hosted migration pending merge

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
- 2026-09-14 (verified via API): approval gate no longer in effect — `main`
  has no required reviews/checks, `dev` is unprotected, no rulesets exist.
  Both PRs report MERGEABLE.
- 2026-09-13: Project setup — upgraded npm 10.9.8 → 11.19.0 (project requires
  ≥11.19.0; old npm crashed with `edgesOut` error), `npm install` (476 pkgs),
  created `.env.local`, fixed `supabase/config.toml` (project_id, PG15, ports
  55421/2/3), `supabase start` + `db reset` OK.
- 2026-09-13: Validation green — `lint`, `typecheck`, `test` (2 passed),
  `build`, dev server 200 on `/` and `/api/health`.
- 2026-09-13: Product onboarding confirmed (static flags, cookie+recovery auth,
  SQL seeding, leaderboards/activity/profile in scope); CONTEXT.md → active.

## In Progress

- Open and review the feature PR from `feat/ctf-access-controls` into `main`.
- Apply migrations `007` through `010` to hosted Supabase only after merge and
  release approval.

## Completed in the current feature branch

- Challenge board with search, category/difficulty filters, hints, authors,
  and external links.
- Public and authenticated leaderboards plus admin team/player rankings.
- Competition-wide access lock and per-player lock/unlock controls.
- Component ownership cleanup: shared primitives in `components/common`, shell
  pieces in `components/layout`, and feature UI in `features/*/components`.
- Challenge author field and single external-link schema migration `010`.

## Blocked

- (none)

## Decisions Made

- 2026-09-13: Local Supabase on ports 55421/55422/55423 + PG15 (sibling stack
  conflict + CLI limitation); dev server on :3000.
