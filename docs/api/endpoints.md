# Server Actions

Server-only entry points (`src/features/*/actions/`). Each validates input
with a zod schema, calls one service, and returns a small serializable
result. Protected actions re-resolve the current player server-side.

## Auth — `src/features/auth/actions/authActions.ts`

| Action                 | Input                                           | Success                                                        | Failure                                               |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| `signUpAction`         | fullName, alias, password == confirm            | `{ recoveryCode, alias, playerId }` (no session yet)           | Field error, `That alias is already taken.`           |
| `continueSignupAction` | playerId + recoveryCode (proves code knowledge) | Issues first session, redirect `/rooms`                        | `Verification failed. Please sign in.`                |
| `signInAction`         | alias, password                                 | Session issued, redirect `/rooms`                              | Generic invalid credentials                           |
| `resetPasswordAction`  | alias, recoveryCode, newPassword == confirm     | Hash updated, all sessions revoked, redirect `/signin?reset=1` | `Alias or recovery code is incorrect.` or field error |
| `logoutAction`         | — (current cookie)                              | Session deleted, redirect `/signin`                            | —                                                     |

Signup creates a bare account: no team, no role. Teams are picked per room
at join time; roles live on the membership row.

## Flags — `src/features/flags/actions/flagActions.ts`

| Action             | Input                        | Success                                                        | Failure                                                                                                     |
| ------------------ | ---------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `submitFlagAction` | roomId (bound) + flag string | `{ status: 'correct', message }` + room-scoped points recorded | `incorrect` / `duplicate` / `error` messages; non-members are bounced to the join page, owners get an error |

## Rooms — `src/features/rooms/actions/roomActions.ts`

| Action                     | Input                             | Behavior                                                         |
| -------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| `createRoomAction`         | name, visibility                  | Any signed-in user; creator becomes OWNER; redirects to the room |
| `joinRoomByCodeAction`     | code (+ teamId)                   | Checks code, lock, team-in-room; redirects to the room           |
| `joinRoomAction`           | roomId (bound) + teamId           | Public rooms only; otherwise use a code                          |
| `leaveRoomAction`          | roomId (bound)                    | Members only; owners cannot leave (would orphan the room)        |
| `setJoinLockedAction`      | roomId (bound) + locked           | Owner only                                                       |
| `regenerateJoinCodeAction` | roomId (bound)                    | Owner only; returns the new code                                 |
| `setMemberLockedAction`    | roomId (bound) + playerId, locked | Owner only; the member control (locked members cannot rejoin)    |
| `updateRoomAction`         | roomId (bound) + name, visibility | Owner only                                                       |
