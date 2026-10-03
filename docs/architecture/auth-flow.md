# Authentication Flow

Custom password accounts on PostgreSQL. No Supabase Auth anywhere in this
version: Supabase is the database only, reached exclusively through the
server-side service-role client (`src/lib/supabase/admin.ts`).

## Signup — `/signup`

Accounts carry no team and no role; teams and roles live on the per-room
membership created at join time.

```
validate input (name, alias, password == confirmation)
  → Argon2id-hash password, generate recovery code (ACD-XXXX-XXXX-XXXX)
  → create bare player account
  → show recovery code ONCE behind an explicit continue gate
  → gate action re-verifies the code, then issues the first session
  → redirect /rooms
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
  → issue persistent session
  → redirect /rooms
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

Per-room locks live on `room_memberships.access_locked` — the only
per-member control. A locked member is bounced to `/signin` and cannot
rejoin until unlocked. There is no global lock.

## Room authorization

Roles come from the membership row, never the account:

```
requireAccount()       any signed-in user, else redirect /signin
requireRoomMember(s)   membership required, else redirect to the join page;
                       locked members redirect to /signin
requireRoomOwner(s)    membership role must be OWNER, else 403
```

Every room-admin page and mutation re-authorizes independently; the room tab
layout redirects are navigation only, never the enforcement boundary.

## Logout

Deletes the current session row, deletes the cookie, redirects `/signin`
(`logoutAction`, used by the profile End Session button).

## Rate limiting

Auth actions call `checkAuthRateLimit()` (`src/lib/security/rateLimit.ts`),
currently a documented no-op boundary. A production-compatible provider must
be integrated there before any public event. Accounts are never locked on
failed attempts.
