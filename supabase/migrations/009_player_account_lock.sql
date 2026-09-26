-- 009_player_account_lock.sql — allow organizers to suspend individual players.
alter table public.players
  add column if not exists access_locked boolean not null default false;

create index if not exists players_access_locked_idx
  on public.players(access_locked)
  where access_locked = true;

grant all on table public.players to service_role;
