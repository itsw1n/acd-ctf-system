-- LOCAL DEVELOPMENT SEED ONLY
-- Applied after migrations by `supabase db reset`.
-- Demo credentials must never be used in production.
--
-- Mirrors the schema from:
--   001_initial_schema.sql — teams(id, name, slug),
--     players(id, full_name, alias, team_id, recovery_code_hash),
--     challenges(id, title, category, points, flag_hash),
--     solves(id, player_id, challenge_id, points_awarded)
--   002_account_auth.sql — players(password_hash, role)
--   003_admin_challenges.sql — challenges(description, type, external_url,
--     file_url, updated_at) + challenges_type_check + challenges_url_rules_check
--   004_teamless_admin.sql — players.team_id nullable +
--     players_team_role_check (PLAYER needs a team, ADMIN must be teamless)
--   005_plaintext_challenge_flags.sql — challenges(flag, MVP-only plaintext)
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
-- Submittable demo flags:
--   ACD{welcome_to_ctf}     (unsolved by win → shows a fresh solve)
--   ACD{hidden_header_demo} (unsolved by dan + rapz → fresh solve;
--                            solved by the rest → duplicate guard)

begin;


-- ============================================================
-- 1. TEAMS
-- ============================================================

insert into public.teams (name, slug)
values
  ('IT Innovators', 'it-innovators'),
  ('Data Wizard', 'data-wizard'),
  ('Tech Pioneers', 'tech-pioneers'),
  ('Cyber Knights', 'cyber-knights');


-- ============================================================
-- 2. CHALLENGES
-- ============================================================
-- flag_hash = sha256(trim(flag)) per src/features/challenges/services/
-- challengeService.ts (hashFlag) and src/lib/security/hash.ts (sha256):
--   ACD{welcome_to_ctf}     -> 1b43b76b143c20b8ae84d75f648f2cb542cbd4f585eb384f1c60d4c063f9c805
--   ACD{hidden_header_demo} -> 4ad75f150616cff694b38fedaec24b547fa9d7b44af2f8aa7d3975647a43c3d5
-- Both are type TEXT, so file_url/external_url stay NULL
-- (challenges_url_rules_check).

insert into public.challenges (
  title,
  category,
  description,
  type,
  points,
  flag,
  flag_hash,
  active
)
values
  (
    'Welcome Flag',
    'Misc',
    'Start here: submit the welcome flag to learn how scoring works.',
    'TEXT',
    50,
    'ACD{welcome_to_ctf}',
    '1b43b76b143c20b8ae84d75f648f2cb542cbd4f585eb384f1c60d4c063f9c805',
    true
  ),
  (
    'Hidden Header',
    'Web',
    'Inspect the HTTP response headers to find the hidden flag.',
    'TEXT',
    100,
    'ACD{hidden_header_demo}',
    '4ad75f150616cff694b38fedaec24b547fa9d7b44af2f8aa7d3975647a43c3d5',
    true
  );


-- ============================================================
-- 3. PLAYER ACCOUNTS
-- ============================================================
-- Password hash is Argon2id('ctf-demo-1234') from the app's hashPassword;
-- recovery hashes are SHA-256 of the UPPERCASED codes above. Role is always
-- PLAYER here, exactly as public signup forces it.

with demo_password(password_hash) as (
  values (
    '$argon2id$v=19$m=65536,p=4,t=3$ZG/3AP+XHiTspdIrDuoYvA$017WlpijjvjqxOhG+qf13Gu7h9Q1537na/TycjthOfQ'
  )
),

accounts (
  full_name,
  alias,
  team_slug,
  recovery_code_hash
) as (
  values
    (
      'Sean',
      'sean',
      'cyber-knights',
      '158ec4157e2ee9edde4f02a3937872ffaad8e36662dac2d8bebb1d824f6a68f8'
    ),
    (
      'Chrmel',
      'chrmel',
      'cyber-knights',
      'c5e02bc1d9a8ba0a810de60c6438b6f634054d1c7e6c990ff744b4d6732a13dd'
    ),
    (
      'Dan',
      'dan',
      'it-innovators',
      'dbe421b4037078bb873d7269dc8c6d936894c86db5997d895303e193a2ec4ee3'
    ),
    (
      'Win',
      'win',
      'data-wizard',
      'cc7a806061861241148d020a3fb7e9b9a8209c82a5d913491b1328b6bcf11906'
    ),
    (
      'Rapz',
      'rapz',
      'tech-pioneers',
      'caf6e89fbc946d911b19261c75d418f60f83abec158053b39464205383c28275'
    )
)

insert into public.players (
  full_name,
  alias,
  team_id,
  recovery_code_hash,
  password_hash,
  role
)
select
  accounts.full_name,
  accounts.alias,
  teams.id,
  accounts.recovery_code_hash,
  demo_password.password_hash,
  'PLAYER'
from accounts
join public.teams as teams
  on teams.slug = accounts.team_slug
cross join demo_password;


-- ============================================================
-- 4. ADMIN ACCOUNT
-- ============================================================
-- Root / root / ADMIN / team_id NULL / zero solves. ADMIN rows hold no
-- team by database invariant (004_teamless_admin.sql). Uses the shared demo
-- password `ctf-demo-1234` and a fixed recovery code for reproducible dev.

with demo_password(password_hash) as (
  values (
    '$argon2id$v=19$m=65536,p=4,t=3$ZG/3AP+XHiTspdIrDuoYvA$017WlpijjvjqxOhG+qf13Gu7h9Q1537na/TycjthOfQ'
  )
)

insert into public.players (
  full_name,
  alias,
  team_id,
  recovery_code_hash,
  password_hash,
  role
)
select
  'Root',
  'root',
  null,
  '6a61fa8754cfa3368f26cca51476b3664b3c9fb2b1eec79e5d0561a977be19b4',
  demo_password.password_hash,
  'ADMIN'
from demo_password;


-- ============================================================
-- 5. SOLVES
-- ============================================================
-- Challenges referenced by title; points_awarded mirrors the challenge's
-- own points. Matches the unique(player_id, challenge_id) guard.

with seeded_solves (
  alias,
  challenge_title
) as (
  values
    ('sean',   'Welcome Flag'),
    ('sean',   'Hidden Header'),
    ('chrmel', 'Welcome Flag'),
    ('chrmel', 'Hidden Header'),
    ('dan',    'Welcome Flag'),
    ('win',    'Hidden Header'),
    ('rapz',   'Welcome Flag')
)

insert into public.solves (
  player_id,
  challenge_id,
  points_awarded
)
select
  players.id,
  challenges.id,
  challenges.points
from seeded_solves
join public.players as players
  on lower(players.alias) = lower(seeded_solves.alias)
join public.challenges as challenges
  on challenges.title = seeded_solves.challenge_title;


commit;
