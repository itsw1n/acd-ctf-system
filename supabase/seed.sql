-- seed.sql — local development data. Applied automatically by
-- `supabase db reset` AFTER migrations. NEVER runs against hosted projects.
--
-- Mirrors the schema from:
--   001_initial_schema.sql — teams(id, name, slug),
--     players(id, full_name, alias, team_id, recovery_code_hash),
--     challenges(id, title, category, points, flag_hash),
--     solves(id, player_id, challenge_id, points_awarded)
--   002_account_auth.sql — players(password_hash, role)
--
-- Scoreboard this seed produces:
--
--   team            players         solves               points
--   Cyber Knights   sean, chrmel    Welcome Flag (50)
--                                   Hidden Header (100)    300
--   Data Wizard     win             Hidden Header (100)    100
--   IT Innovators   dan             Welcome Flag (50)       50
--   Tech Pioneers   rapz            Welcome Flag (50)       50
--
-- Demo credentials (DEV ONLY — remove before any real event).
-- Shared password for ALL demo accounts (players + admin): ctf-demo-1234
--   sean    / ACD-MNGK-AVCB-3XP3
--   chrmel  / ACD-M592-J8J7-XWFM
--   dan     / ACD-FYMJ-C42W-HG4W
--   win     / ACD-HTPV-EWGL-QT5L
--   rapz    / ACD-S9HL-N2VK-YQUQ
--   root    / ACD-ROOT-ADMIN-001    (admin recovery code)
--
-- Submittable demo flags (plaintext also in README):
--   ACD{welcome_to_ctf}     (unsolved by win → shows a fresh solve)
--   ACD{hidden_header_demo} (unsolved by dan + rapz → fresh solve;
--                            solved by the rest → duplicate guard)

-- MVP-only: the admin editor needs the plaintext flag to remain recoverable.
update public.challenges
set flag = case title
  when 'Welcome Flag' then 'ACD{welcome_to_ctf}'
  when 'Hidden Header' then 'ACD{hidden_header_demo}'
end
where title in ('Welcome Flag', 'Hidden Header') and flag is null;

-- 1. players(full_name, alias, team_id, recovery_code_hash, password_hash, role).
--    Password hash is Argon2id('ctf-demo-1234') from the app's hashPassword;
--    recovery hashes are SHA-256 of the codes above. Role is always PLAYER
--    here, exactly as public signup forces it.
with demo_password(password_hash) as (
  values ('$argon2id$v=19$m=65536,p=4,t=3$ZG/3AP+XHiTspdIrDuoYvA$017WlpijjvjqxOhG+qf13Gu7h9Q1537na/TycjthOfQ')
)
insert into public.players (full_name, alias, team_id, recovery_code_hash, password_hash, role)
select
  v.full_name,
  v.alias,
  teams.id,
  v.recovery_code_hash,
  demo_password.password_hash,
  'PLAYER'
from public.teams as teams
cross join demo_password
join (values
  ('Sean', 'sean', 'cyber-knights', '158ec4157e2ee9edde4f02a3937872ffaad8e36662dac2d8bebb1d824f6a68f8'),
  ('Chrmel', 'chrmel', 'cyber-knights', 'c5e02bc1d9a8ba0a810de60c6438b6f634054d1c7e6c990ff744b4d6732a13dd'),
  ('Dan', 'dan', 'it-innovators', 'dbe421b4037078bb873d7269dc8c6d936894c86db5997d895303e193a2ec4ee3'),
  ('Win', 'win', 'data-wizard', 'cc7a806061861241148d020a3fb7e9b9a8209c82a5d913491b1328b6bcf11906'),
  ('Rapz', 'rapz', 'tech-pioneers', 'caf6e89fbc946d911b19261c75d418f60f83abec158053b39464205383c28275')
) as v(full_name, alias, slug, recovery_code_hash)
  on teams.slug = v.slug
-- Same semantics as players_alias_lower_unique: aliases collide case-insensitively.
where not exists (select 1 from public.players where lower(alias) = lower(v.alias));

-- 2. solves(player_id, challenge_id, points_awarded).
--    Challenges referenced by title (seed-controlled in 001, unambiguous here);
--    points_awarded always mirrors the challenge's own points. Matches the
--    unique(player_id, challenge_id) guard, so re-running the seed is safe.
insert into public.solves (player_id, challenge_id, points_awarded)
select players.id, challenges.id, challenges.points
from public.players as players
join (values
  ('sean', 'Welcome Flag'),
  ('sean', 'Hidden Header'),
  ('chrmel', 'Welcome Flag'),
  ('chrmel', 'Hidden Header'),
  ('dan', 'Welcome Flag'),
  ('win', 'Hidden Header'),
  ('rapz', 'Welcome Flag')
) as v(alias, challenge_title)
  on lower(players.alias) = lower(v.alias)
join public.challenges as challenges
  on challenges.title = v.challenge_title
where not exists (
  select 1 from public.solves
  where player_id = players.id and challenge_id = challenges.id
);

-- 3. DEV ONLY admin account (local `supabase db reset` only — seed.sql is
--    never applied to hosted projects).
--    Root / root / ADMIN / team_id NULL / zero solves. ADMIN rows hold no
--    team by database invariant (004_teamless_admin.sql), so there is no
--    team to pick here. Uses shared demo password `ctf-demo-1234` and
--    fixed recovery code for reproducible local dev.
with demo_password(password_hash) as (
  values ('$argon2id$v=19$m=65536,p=4,t=3$ZG/3AP+XHiTspdIrDuoYvA$017WlpijjvjqxOhG+qf13Gu7h9Q1537na/TycjthOfQ')
)
insert into public.players (full_name, alias, team_id, recovery_code_hash, password_hash, role)
select
  'Root',
  'root',
  null,
  '6a61fa8754cfa3368f26cca51476b3664b3c9fb2b1eec79e5d0561a977be19b4',
  demo_password.password_hash,
  'ADMIN'
from demo_password
where not exists (select 1 from public.players where lower(alias) = 'root');
