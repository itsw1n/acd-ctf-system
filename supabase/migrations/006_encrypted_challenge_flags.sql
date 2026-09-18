-- 006_encrypted_challenge_flags.sql — encrypt challenge flags at rest.
--
-- Replaces the MVP plaintext `flag` column (005) with `flag_encrypted`
-- (AES-256-GCM, application-side; see src/lib/security/flagCrypto.ts).
-- No data backfill: real events start from a clean hosted database
-- (migrations only, seed never applies there), and local databases are
-- rebuilt via `supabase db reset`. Flag submission keeps using the
-- SHA-256 `flag_hash`; decryption happens server-side only, for the
-- admin edit form.

alter table public.challenges
  add column if not exists flag_encrypted text;

alter table public.challenges
  drop column if exists flag;

grant all on table public.challenges to service_role;
