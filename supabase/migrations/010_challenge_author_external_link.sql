-- Use one external link for Drive files and hosted challenge resources.
alter table public.challenges
  add column if not exists author text;

update public.challenges
set author = 'Unknown'
where author is null or author = '';

alter table public.challenges
  alter column author set default 'Unknown',
  alter column author set not null;

alter table public.challenges drop constraint if exists challenges_url_rules_check;
alter table public.challenges drop constraint if exists challenges_type_check;
alter table public.challenges drop column if exists file_url;

alter table public.challenges
  add constraint challenges_type_check check (type in ('TEXT', 'EXTERNAL'));

alter table public.challenges
  add constraint challenges_url_rules_check check (
    (type = 'TEXT' and external_url is null)
    or (type = 'EXTERNAL' and external_url is not null and external_url <> '')
  );

grant all on table public.challenges to service_role;
