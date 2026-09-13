-- 004_teamless_admin.sql — ADMIN accounts exist without a competition team.
--
-- Invariant (both sides enforced):
--   PLAYER -> team_id IS NOT NULL
--   ADMIN  -> team_id IS NULL
--
-- Local databases may hold ADMIN rows that were manually promoted while
-- team_id was NOT NULL (see docs/guides/demo.md). Move them off teams
-- BEFORE adding the constraint so the migration applies cleanly.

update public.players
set team_id = null
where role = 'ADMIN' and team_id is not null;

alter table public.players alter column team_id drop not null;

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'players_team_role_check'
  ) then
    alter table public.players drop constraint players_team_role_check;
  end if;
end $$;

alter table public.players
  add constraint players_team_role_check check (
    (role = 'PLAYER' and team_id is not null)
    or (role = 'ADMIN' and team_id is null)
  );

-- players_role_check, the teams FK, and ON DELETE RESTRICT are untouched:
-- deleting a team with PLAYER members is still blocked; ADMIN rows hold
-- no team reference at all.

grant all on table public.players to service_role;
