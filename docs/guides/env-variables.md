# Environment Variables

Copy the generated example before starting. Client environment location: `.env.local`.

| Variable                               | Visibility    | Required | Purpose                                                                                                                                                                             |
| -------------------------------------- | ------------- | -------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | client/public |      yes | Supabase project URL.                                                                                                                                                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client/public |      yes | Public Supabase key; direct client DB access is disabled by design (deny-by-default, no RLS policies — all data access is server-side via the service-role client).                 |
| `SUPABASE_SERVICE_ROLE_KEY`            | server-only   |      yes | Service-role key for server-side Supabase access. Never expose to the browser.                                                                                                      |
| `SESSION_COOKIE_NAME`                  | server-only   |       no | Session cookie name (defaults to `acd_ctf_session`).                                                                                                                                |
| `FLAG_ENCRYPTION_KEY`                  | server-only   |      yes | 64 hex chars (32 bytes) for challenge flag encryption (AES-256-GCM). Generate once with `openssl rand -hex 32`. Required at startup; without it challenge create/edit fails closed. |

Values with `NEXT_PUBLIC_` are bundled into client code and must never contain secrets. Keep real environment files out of version control.
