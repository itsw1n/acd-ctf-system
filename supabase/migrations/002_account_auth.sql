-- 002_account_auth.sql — evolve players/player_sessions for password accounts.
--
-- DEV-DATA NOTE: existing development players have no password and cannot sign
-- in after this migration. Do not assign default passwords. Either reset the
-- local database (`npm run supabase:reset`, which replays 001 + 002 on a clean
-- database) or set a password per player via the forgot-password flow once the
-- application code lands. RLS posture is unchanged: anon/authenticated keep no
-- table access; only service_role (server-side) reads and writes.

-- 1. Password hash for Argon2id verification. Nullable so the migration applies
--    cleanly on databases that already hold passwordless dev players; the
--    application requires a password for every new signup and every signin.
alter table public.players
  add column if not exists password_hash text;

-- 2. Account role. Constrained text (not an enum) to keep PostgREST simple.
--    Public signup always forces PLAYER server-side; promotion is manual SQL.
alter table public.players
  add column if not exists role text not null default 'PLAYER'
  constraint players_role_check check (role in ('PLAYER', 'ADMIN'));

-- 3. Optional session activity marker. Written once at session creation and
--    never updated on reads, so it adds no per-request write load. No
--    application logic may depend on its freshness.
alter table public.player_sessions
  add column if not exists last_seen_at timestamptz;

-- Backfill: existing sessions started before this column existed.
update public.player_sessions
  set last_seen_at = created_at
  where last_seen_at is null;

-- Keep the service-role-only grants consistent for the evolved tables.
grant all on table public.players to service_role;
grant all on table public.player_sessions to service_role;
