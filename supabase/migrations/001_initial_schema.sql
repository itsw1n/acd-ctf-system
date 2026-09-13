create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 80),
  alias text not null check (char_length(alias) between 2 and 24),
  team_id uuid not null references public.teams(id) on delete restrict,
  recovery_code_hash char(64) not null,
  created_at timestamptz not null default now()
);

create unique index if not exists players_alias_lower_unique
  on public.players (lower(alias));

create table if not exists public.player_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  token_hash char(64) not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists player_sessions_player_id_idx
  on public.player_sessions(player_id);

create index if not exists player_sessions_expires_at_idx
  on public.player_sessions(expires_at);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  points integer not null check (points > 0),
  flag_hash char(64) not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.solves (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  points_awarded integer not null check (points_awarded > 0),
  solved_at timestamptz not null default now(),
  unique(player_id, challenge_id)
);

create index if not exists solves_player_id_idx on public.solves(player_id);
create index if not exists solves_challenge_id_idx on public.solves(challenge_id);
create index if not exists solves_solved_at_idx on public.solves(solved_at desc);

alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.player_sessions enable row level security;
alter table public.challenges enable row level security;
alter table public.solves enable row level security;

revoke all on table public.teams from anon, authenticated;
revoke all on table public.players from anon, authenticated;
revoke all on table public.player_sessions from anon, authenticated;
revoke all on table public.challenges from anon, authenticated;
revoke all on table public.solves from anon, authenticated;

grant all on table public.teams to service_role;
grant all on table public.players to service_role;
grant all on table public.player_sessions to service_role;
grant all on table public.challenges to service_role;
grant all on table public.solves to service_role;

insert into public.teams (name, slug)
values
  ('IT Innovators', 'it-innovators'),
  ('Data Wizard', 'data-wizard'),
  ('Tech Pioneers', 'tech-pioneers'),
  ('Cyber Knights', 'cyber-knights')
on conflict (slug) do nothing;

-- Demo hashes only. Remove these rows before the real event and add your own hashed flags.
insert into public.challenges (title, category, points, flag_hash)
values
  ('Welcome Flag', 'Misc', 50, '1b43b76b143c20b8ae84d75f648f2cb542cbd4f585eb384f1c60d4c063f9c805'),
  ('Hidden Header', 'Web', 100, '4ad75f150616cff694b38fedaec24b547fa9d7b44af2f8aa7d3975647a43c3d5')
on conflict (flag_hash) do nothing;
