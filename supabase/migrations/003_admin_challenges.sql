-- Admin challenge management: description/type/urls/updated_at.
-- Adds columns nullable-first, backfills existing rows explicitly, then constrains.

alter table public.challenges add column if not exists description text null;
alter table public.challenges add column if not exists type text null;
alter table public.challenges add column if not exists external_url text null;
alter table public.challenges add column if not exists file_url text null;
alter table public.challenges add column if not exists updated_at timestamptz null;

-- Backfill legacy rows (seeded via SQL before admin UI existed).
update public.challenges
set description = title || ' — ' || category || ' challenge.'
where description is null or description = '';

update public.challenges
set type = 'TEXT'
where type is null;

update public.challenges
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

-- Enforce NOT NULL after backfill (no permanent '' default for description).
alter table public.challenges alter column description set not null;
alter table public.challenges alter column type set not null;
alter table public.challenges alter column type set default 'TEXT';
alter table public.challenges alter column updated_at set not null;
alter table public.challenges alter column updated_at set default now();

-- Type constraint (drop-then-add to stay idempotent on re-run).
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'challenges_type_check'
  ) then
    alter table public.challenges drop constraint challenges_type_check;
  end if;
end $$;

alter table public.challenges
  add constraint challenges_type_check check (type in ('TEXT', 'FILE', 'EXTERNAL'));

-- URL presence rules. Empty strings are rejected for required URLs.
-- URL syntax (valid http/https) stays Zod-owned at the application boundary.
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'challenges_url_rules_check'
  ) then
    alter table public.challenges drop constraint challenges_url_rules_check;
  end if;
end $$;

alter table public.challenges
  add constraint challenges_url_rules_check check (
    (type = 'TEXT' and external_url is null and file_url is null)
    or (type = 'FILE' and file_url is not null and file_url <> '' and external_url is null)
    or (type = 'EXTERNAL' and external_url is not null and external_url <> '' and file_url is null)
  );

grant all on table public.challenges to service_role;
