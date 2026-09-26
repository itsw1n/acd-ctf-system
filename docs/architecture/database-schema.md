# Database Schema

PostgreSQL via Supabase. Migrations live in `supabase/migrations/` and apply
in filename order; `supabase/seed.sql` holds local-only demo data (see
[`../guides/demo.md`](../guides/demo.md)).

## Tables

### teams

| Column     | Type        | Notes                |
| ---------- | ----------- | -------------------- |
| id         | uuid PK     | `gen_random_uuid()`  |
| name       | text        | unique               |
| slug       | text        | unique, URL-safe key |
| created_at | timestamptz | default `now()`      |

Seeded with 4 teams (`001`): IT Innovators, Data Wizard, Tech Pioneers,
Cyber Knights.

### players

| Column             | Type        | Notes                                                    |
| ------------------ | ----------- | -------------------------------------------------------- |
| id                 | uuid PK     | `gen_random_uuid()`                                      |
| full_name          | text        | 2–80 chars                                               |
| alias              | text        | 2–24 chars, unique case-insensitively                    |
| team_id            | uuid FK     | → `teams.id`, `on delete restrict`                       |
| recovery_code_hash | char(64)    | SHA-256 of the one-time code, never plaintext            |
| password_hash      | text        | Argon2id (`002`); nullable only for legacy dev rows      |
| role               | text        | `PLAYER` / `ADMIN` check (`002`); signup forces `PLAYER` |
| access_locked      | boolean     | default `false`; per-player admin lock (`009`)           |
| created_at         | timestamptz | default `now()`                                          |

`players_alias_lower_unique on lower(alias)` — `byteknight` and `BYTEKNIGHT`
conflict while display casing is preserved.

### player_sessions

| Column       | Type        | Notes                                           |
| ------------ | ----------- | ----------------------------------------------- |
| id           | uuid PK     | `gen_random_uuid()`                             |
| player_id    | uuid FK     | → `players.id`, `on delete cascade`             |
| token_hash   | char(64)    | SHA-256 of the opaque token, unique             |
| expires_at   | timestamptz | 3-day rolling window set by the app             |
| created_at   | timestamptz | default `now()`                                 |
| last_seen_at | timestamptz | `002`; written once at creation, never on reads |

### challenges

| Column       | Type        | Notes                                            |
| ------------ | ----------- | ------------------------------------------------ |
| id           | uuid PK     | `gen_random_uuid()`                              |
| title        | text        | display name                                     |
| author       | text        | required challenge author (`010`)                |
| category     | text        | e.g. Misc, Web                                   |
| description  | text        | player-facing briefing (`003`, backfilled)       |
| type         | text        | `TEXT` / `EXTERNAL` (`010`)                      |
| points       | integer     | `> 0`                                            |
| flag_hash    | char(64)    | SHA-256 of the flag, unique                      |
| external_url | text null   | one optional Drive/hosted resource link (`010`)  |
| active       | boolean     | default `true`                                   |
| created_at   | timestamptz | default `now()`                                  |
| updated_at   | timestamptz | default `now()`, touched on admin writes (`003`) |

`challenges_url_rules_check` (`010`): `TEXT` has no URL; `EXTERNAL` requires a
non-empty `external_url`. URL syntax stays application-owned (Zod http/https
parsing). The legacy `file_url` column and `FILE` type were removed.

### solves

| Column         | Type        | Notes                                               |
| -------------- | ----------- | --------------------------------------------------- |
| id             | uuid PK     | `gen_random_uuid()`                                 |
| player_id      | uuid FK     | → `players.id`, `on delete cascade`                 |
| challenge_id   | uuid FK     | → `challenges.id`, `on delete cascade`              |
| points_awarded | integer     | `> 0`, mirrors the challenge's points at solve time |
| solved_at      | timestamptz | default `now()`                                     |

`unique(player_id, challenge_id)` — duplicate-solve protection at the
database layer.

## Access model

Row Level Security is enabled on every table. `anon` and `authenticated`
roles are fully revoked; only `service_role` (the server-side Next.js client)
reads and writes. There are no per-row policies because no browser-held
credential ever touches the database directly.

Player access locks are enforced in the server sign-in and session paths. The
admin mutation updates only `PLAYER` rows and revokes all sessions when a
player is locked.
