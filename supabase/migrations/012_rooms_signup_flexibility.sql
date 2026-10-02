-- 012_rooms_signup_flexibility.sql — teams are chosen per room at join time,
-- so public signup no longer assigns a global team. Drop the invariant that
-- forced every PLAYER row to carry a team_id. players.role and the global
-- team columns stay until the 013 cleanup, after the code stops reading them.
--
-- Invariant removed:
--   PLAYER -> team_id IS NOT NULL

alter table public.players drop constraint if exists players_team_role_check;

grant all on table public.players to service_role;
