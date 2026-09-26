create table if not exists public.competition_settings (
  id boolean primary key default true check (id),
  signups_locked boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.competition_settings (id)
values (true)
on conflict (id) do nothing;

alter table public.competition_settings enable row level security;
revoke all on table public.competition_settings from anon, authenticated;
grant all on table public.competition_settings to service_role;
