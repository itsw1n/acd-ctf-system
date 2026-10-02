-- 013_rooms_cleanup.sql — retire the single-competition model.
--
-- The code no longer reads players.role, players.team_id, or
-- players.access_locked (authority lives on room_memberships), no longer
-- uses the global competition_settings singleton (per-room join_locked
-- instead), and scopes teams/challenges by room. Drop what's obsolete:
--   players.role + players_role_check
--   players.team_id (+ FK) — teams are chosen per room at join time
--   players.access_locked (+ partial index) — locks are per membership
--   competition_settings table
--   global team/challenge uniques, superseded by the per-room ones from 011
--
-- Backfill safety: 011 already moved every row into the default room, so
-- dropping columns loses no reachable data.

alter table public.players drop constraint if exists players_team_role_check;
alter table public.players drop constraint if exists players_role_check;
alter table public.players drop column if exists team_id;
alter table public.players drop column if exists role;
alter table public.players drop column if exists access_locked;

drop index if exists public.players_access_locked_idx;

drop table if exists public.competition_settings;

alter table public.teams drop constraint if exists teams_name_key;
alter table public.teams drop constraint if exists teams_slug_key;

-- The global flag-hash unique was needed while lookups were unscoped;
-- submissions now resolve (room_id, flag_hash).
alter table public.challenges drop constraint if exists challenges_flag_hash_key;

grant all on table public.players to service_role;
grant all on table public.teams to service_role;
grant all on table public.challenges to service_role;
