# Rooms redesign — multi-room CTF platform

Status: approved by user 2026-10-02. Implementation in phases; phase 1–2 first.

## Goal

Any signed-in user can create a room (a competition they administer: challenges,
teams, members, solves, settings) and join other users' rooms as a participant.
Authority is per room only. There is no site-wide admin role.

## Product decisions (user-approved)

- Teams belong to a room. The host defines teams; participants pick one when joining.
- Rooms are public (listed, anyone joins) or private (join code only, regenerable,
  join can be locked by the host).
- An owner cannot submit flags in their own room. Owners can play in other rooms.
- Exactly one owner per room (transfer deferred).
- Signup is account-only: alias, name, password. No team field, no role.
- Existing data migrates into one default room (`acd-ctf`); nothing is lost.
- Routes are one path per room: `/rooms/[slug]`, `/rooms/[slug]/play`,
  `/rooms/[slug]/activity`, `/rooms/[slug]/admin/*`, plus `/rooms`,
  `/rooms/new`, `/rooms/join`, `/rooms/browse`. Old `/admin/*` and
  `/challenges` redirect; `/dashboard` is removed.
- Signed-in landing is My Rooms (owned + joined). Public guest landing stays.
- Scores and activity are per room. The header shows the current room's score.
- Flag hashes are unique per room, not site-wide.
- Join lock and ban are per room. The global signup lock and global role retire.
- Public room leaderboards require membership (no view-only mode for now).
- `players` keeps its name for this change (a rename to `accounts` is deferred
  to a separate churn-only PR).

## Schema (migration 011_rooms.sql)

New tables:

- `rooms(id, slug unique, name, visibility PUBLIC/PRIVATE, join_code unique
nullable, join_locked bool default false, created_at)`.
- `room_memberships(room_id, player_id, role OWNER/PARTICIPANT, team_id
nullable, access_locked bool default false, joined_at)`,
  `UNIQUE(room_id, player_id)`, plus a partial unique index enforcing exactly
  one OWNER per room. No `rooms.owner_id` column: the OWNER membership row is
  the single source of ownership so ownership can transfer later.
- `room_bans(room_id, player_id, created_at)`, `UNIQUE(room_id, player_id)`.
  A ban deletes the membership and inserts a ban row; joining checks the ban
  list first, so a banned user cannot rejoin with the code. Bans are per room.

Changed tables:

- `teams`: add `room_id not null`; uniqueness becomes per room
  (`UNIQUE(room_id, slug)`, unique `lower(name)` per room); FK cascade on room
  delete is out of scope — deleting rooms is deferred.
- `challenges`: add `room_id not null`; flag-hash uniqueness becomes
  `(room_id, flag_hash)`.
- `solves`: add `room_id not null` with composite FK
  `(challenge_id, room_id) references challenges(id, room_id)` so a solve can
  never reference another room's challenge.
- `players`: drop `role`, `team_id`, `access_locked` (moved to memberships).
  `alias` stays globally unique as the login id.
- `competition_settings`: dropped; per-room `join_locked` replaces it.

Backfill: one default room (`slug 'acd-ctf'`), current `root` becomes its
OWNER, all existing teams/challenges/solves get that `room_id`.

## Guards (replace requireAdmin / requirePlayer)

- `requireAccount()` — any signed-in user.
- `requireRoomMember(slug)` — returns `{ player, room, membership }`; non-member
  redirects to `/rooms/[slug]/join`.
- `requireRoomOwner(slug)` — membership role must be OWNER (403 otherwise).
  Used by every room-admin page AND every room-admin mutation.
- Every read query takes `roomId` and filters by it. Known unscoped hotspots
  that must gain a room filter: leaderboard, overview, solve, player-admin,
  team-admin, challenge list/edit, player challenge list, competition status.
- Flag submission resolves the challenge by `(room_id, flag_hash)` where
  `room_id` comes from the route — never from client input. Owner submissions
  in their own room are rejected (membership role must be PARTICIPANT).

## Unchanged on purpose

Argon2id passwords, opaque DB-backed sessions, global alias uniqueness,
recovery-code flow, shared Modal/Select/Navigation components, design tokens.
No JWT, no refresh tokens, no Supabase Auth.

## Test plan

- Unit: guards (owner/member/guest/locked/banned matrix), per-room scoping of
  leaderboard/solves/teams/challenges, owner-cannot-play, per-room flag
  uniqueness, join-code + lock flows.
- E2E: two-user flow (host creates room + challenge, guest joins via code,
  submits flag, host sees solve); old-path redirects; signup without team.
- Rewrite `e2e/admin-auth.spec.ts` for the room model.

## Phases

1. Schema + migration (new tables, scoping columns, backfill). Implemented as
   additive migration `011_rooms.sql` (old columns stay so the tree stays
   green); the drops move to a later `012_rooms_cleanup.sql` once the code is
   re-scoped. Verified with local `db reset` + row-count and constraint checks.
2. Guards + room CRUD (requireAccount/Member/Owner, create/browse/join/leave,
   visibility + codes + locks, unit tests).
3. Scope existing features (challenges, teams, solves, leaderboard, activity,
   admin pages take roomId; per-room flag uniqueness; owner-cannot-play).
4. Auth + routes rework (teamless signup, My Rooms landing, /rooms/[slug]/\*,
   redirects, navigation).
5. Seed, docs, tests (demo room, e2e rewrite, CONTEXT.md + architecture docs).

## Risks

- Migration 011 is the riskiest step: verify with local `db reset` + row counts.
- ~16 query hotspots must all gain room scoping; missing one leaks cross-room
  data. The per-query `requireRoomOwner`/`requireRoomMember` pattern from the
  admin hardening work applies unchanged.
- Route restructure touches navigation, redirects, and revalidation paths.
