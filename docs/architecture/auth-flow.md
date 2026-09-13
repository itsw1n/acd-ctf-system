# Authentication Flow

Custom password accounts on PostgreSQL. No Supabase Auth anywhere in this
version: Supabase is the database only, reached exclusively through the
server-side service-role client (`src/lib/supabase/admin.ts`).

## Signup — `/signup`

```
validate input (team, name, alias, password == confirmation)
  → verify team exists
  → Argon2id-hash password, generate recovery code (ACD-XXXX-XXXX-XXXX)
  → create player (role forced to PLAYER, never from client data)
  → show recovery code ONCE behind an explicit continue gate
  → gate action re-verifies the code, then issues the first session
  → redirect /dashboard
```

The session cookie is deliberately NOT issued during signup itself: setting a
cookie inside that action reloads the route and would drop the one-time code
state. The gated continue step proves knowledge of the code before any
session exists.

## Signin — `/signin`

```
validate input
  → find player by case-insensitive alias (exact lower() match in code,
    because ilike treats `_` as a wildcard)
  → Argon2id-verify (dummy hash when alias unknown or passwordless,
    so timing reveals nothing)
  → issue persistent session → redirect /dashboard
```

Failure is always `Invalid alias or password.` — unknown alias and wrong
password are indistinguishable.

## Forgot password — `/forgot-password`

Stateless two-step form. Step 2 resubmits alias + code + new passwords; the
server re-verifies everything — no reset-token infrastructure, no client
state trusted. Success updates `password_hash`, **revokes ALL sessions** for
the player, and redirects to `/signin?reset=1` for a fresh login.

## Sessions

Opaque 256-bit token → only `SHA-256(token)` stored in `player_sessions`.
Cookie: HttpOnly, `SameSite=Lax`, `Path=/`, persistent 3-day expiry,
`Secure` in production. `last_seen_at` is written once at creation and never
on reads.

Validation on every protected route and action (`requireCurrentPlayer`):
cookie → hash → row lookup → expiry check → player load, else redirect
`/signin`. Client state is never trusted for authorization.

## Logout

Deletes the current session row, deletes the cookie, redirects `/signin`
(`logoutAction`, used by the profile End Session button).

## Rate limiting

Auth actions call `checkAuthRateLimit()` (`src/lib/security/rateLimit.ts`),
currently a documented no-op boundary. A production-compatible provider must
be integrated there before any public event. Accounts are never locked on
failed attempts.
