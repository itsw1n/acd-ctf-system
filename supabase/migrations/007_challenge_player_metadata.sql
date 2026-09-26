alter table public.challenges
  add column if not exists difficulty text null,
  add column if not exists hint text null;

update public.challenges set difficulty = 'MEDIUM'
where difficulty is null or difficulty = '';

alter table public.challenges
  alter column difficulty set default 'MEDIUM',
  alter column difficulty set not null;

alter table public.challenges drop constraint if exists challenges_difficulty_check;
alter table public.challenges add constraint challenges_difficulty_check
  check (difficulty in ('EASY', 'MEDIUM', 'HARD'));

grant all on table public.challenges to service_role;
