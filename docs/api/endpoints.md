# Server Actions

Server-only entry points (`src/features/*/actions/`). Each validates input
with a zod schema, calls one service, and returns a small serializable
result. Protected actions re-resolve the current player server-side.

## Auth — `src/features/auth/actions/authActions.ts`

| Action                 | Input                                           | Success                                                        | Failure                                                                      |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `signUpAction`         | teamId, fullName, alias, password == confirm    | `{ recoveryCode, alias, playerId }` (no session yet)           | Field error, `That alias is already taken.`, `Selected team does not exist.` |
| `continueSignupAction` | playerId + recoveryCode (proves code knowledge) | Issues first session, redirect `/challenges`                   | `Verification failed. Please sign in.`                                       |
| `signInAction`         | alias, password                                 | Session issued, redirect `/challenges` (admins → `/admin`)     | Generic invalid credentials, competition lock, or account lock message       |
| `resetPasswordAction`  | alias, recoveryCode, newPassword == confirm     | Hash updated, all sessions revoked, redirect `/signin?reset=1` | `Alias or recovery code is incorrect.` or field error                        |
| `logoutAction`         | — (current cookie)                              | Session deleted, redirect `/signin`                            | —                                                                            |

## Flags — `src/features/flags/actions/flagActions.ts`

| Action             | Input       | Success                                            | Failure                                                                                                                 |
| ------------------ | ----------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `submitFlagAction` | flag string | `{ status: 'correct', message }` + points recorded | `incorrect` / `duplicate` / `error` messages; unauthenticated callers are redirected to `/signin` before any logic runs |

## Access control actions

| Action                  | Input                       | Behavior                                                    |
| ----------------------- | --------------------------- | ----------------------------------------------------------- |
| `setSignupLockAction`   | locked boolean              | Admin-only competition-wide player signup/signin lock       |
| `setPlayerAccessAction` | player UUID, locked boolean | Admin-only player lock/unlock; locking revokes all sessions |
