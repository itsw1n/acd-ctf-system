# Error Message Registry

User-visible failure messages are deliberately generic where they could leak
account existence. The exact strings:

| Message                                                   | When                                    |
| --------------------------------------------------------- | --------------------------------------- |
| `Invalid alias or password.`                              | Signin: unknown alias OR wrong password |
| `That alias is already taken. Choose another hacker tag.` | Signup with a taken alias               |
| `Alias or recovery code is incorrect.`                    | Password reset with bad alias/code      |
| `Check your registration details.` / field messages       | Schema validation failures              |
| `Verification failed. Please sign in.`                    | Continue-after-signup with a bad code   |

Never surface: password hashes, tokens, cookies, raw SQL errors, or whether
an alias exists.
