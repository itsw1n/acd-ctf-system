-- 011_rooms.sql — multi-room model, ADDITIVE step.
--
-- Creates rooms, room_memberships, and room_bans, adds room_id scoping
-- columns, and backfills everything into one default room. Old global
-- columns, checks, and unique constraints stay untouched so the current
-- codebase keeps working; a follow-up migration drops them once the code
-- is re-scoped per room.
--
-- Model:
--   rooms              one row per competition; slug is the URL key.
--   room_memberships   per-room role (OWNER/PARTICIPANT), team, and lock.
--                      Exactly one OWNER per room (partial unique index).
--                      This replaces players.role / players.team_id /
--                      players.access_locked once 012 lands.
--   room_bans          per-room ban list; joining checks it first so a
--                      banned player cannot rejoin with the code.

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 2 and 60),
  name text not null check (char_length(name) between 2 and 80),
  visibility text not null default 'PUBLIC' check (visibility in ('PUBLIC', 'PRIVATE')),
  join_code text unique,
  join_locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.room_memberships (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  role text not null check (role in ('OWNER', 'PARTICIPANT')),
  team_id uuid references public.teams(id) on delete restrict,
  access_locked boolean not null default false,
  joined_at timestamptz not null default now(),
  unique(room_id, player_id)
);

-- Exactly one OWNER per room.
create unique index if not exists room_memberships_single_owner_idx
  on public.room_memberships (room_id)
  where role = 'OWNER';

create table if not exists public.room_bans (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(room_id, player_id)
);

create index if not exists room_memberships_room_id_idx
  on public.room_memberships(room_id);
create index if not exists room_memberships_player_id_idx
  on public.room_memberships(player_id);
create index if not exists room_bans_room_id_idx
  on public.room_bans(room_id);

-- Scoping columns. Nullable first, backfilled below, then NOT NULL.
alter table public.teams
  add column if not exists room_id uuid references public.rooms(id) on delete cascade;

alter table public.challenges
  add column if not exists room_id uuid references public.rooms(id) on delete cascade;

alter table public.solves
  add column if not exists room_id uuid references public.rooms(id) on delete cascade;

-- Composite identity needed so solves can reference (challenge, room) as one unit.
alter table public.challenges
  drop constraint if exists challenges_id_room_unique;
alter table public.challenges
  add constraint challenges_id_room_unique unique (id, room_id);

-- Per-room uniqueness for teams and flags. Old global uniques stay until 012.
alter table public.teams
  drop constraint if exists teams_room_slug_unique;
alter table public.teams
  add constraint teams_room_slug_unique unique (room_id, slug);

create unique index if not exists teams_room_name_lower_unique
  on public.teams (room_id, lower(name));

alter table public.challenges
  drop constraint if exists challenges_room_flag_hash_unique;
alter table public.challenges
  add constraint challenges_room_flag_hash_unique unique (room_id, flag_hash);

-- Backfill: everything that exists today belongs to one default room.
insert into public.rooms (slug, name, visibility, join_code)
select
  'acd-ctf',
  'ACD CTF',
  'PUBLIC',
  -- Same RM-XXXXXX shape the app generates (see generateJoinCode): 6 chars
  -- from the unambiguous alphabet.
  'RM-' || string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random() * 32) + 1)::int, 1),
    '' order by ord
  )
from generate_series(1, 6) as ord
on conflict (slug) do nothing;

update public.teams
set room_id = (select id from public.rooms where slug = 'acd-ctf')
where room_id is null;

update public.challenges
set room_id = (select id from public.rooms where slug = 'acd-ctf')
where room_id is null;

update public.solves
set room_id = (
  select room_id from public.challenges where public.challenges.id = public.solves.challenge_id
)
where room_id is null;

insert into public.room_memberships (room_id, player_id, role, team_id, access_locked)
select
  (select id from public.rooms where slug = 'acd-ctf'),
  players.id,
  case when players.role = 'ADMIN' then 'OWNER' else 'PARTICIPANT' end,
  players.team_id,
  players.access_locked
from public.players
on conflict (room_id, player_id) do nothing;

-- A solve must never reference another room's challenge.
alter table public.solves
  drop constraint if exists solves_room_challenge_fk;
alter table public.solves
  add constraint solves_room_challenge_fk
  foreign key (challenge_id, room_id)
  references public.challenges(id, room_id);

alter table public.teams alter column room_id set not null;
alter table public.challenges alter column room_id set not null;
alter table public.solves alter column room_id set not null;

alter table public.rooms enable row level security;
alter table public.room_memberships enable row level security;
alter table public.room_bans enable row level security;

revoke all on table public.rooms from anon, authenticated;
revoke all on table public.room_memberships from anon, authenticated;
revoke all on table public.room_bans from anon, authenticated;

grant all on table public.rooms to service_role;
grant all on table public.room_memberships to service_role;
grant all on table public.room_bans to service_role;
grant all on table public.teams to service_role;
grant all on table public.challenges to service_role;
grant all on table public.solves to service_role;
