-- MVP-only flag recovery for the admin challenge editor.
-- TODO: replace with encrypted-at-rest storage before production use.

alter table public.challenges
  add column if not exists flag text;

grant all on table public.challenges to service_role;