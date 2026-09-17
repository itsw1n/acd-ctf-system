# Environment Variables

Copy the generated example before starting. Client environment location: `.env.local`.

| Variable                               | Visibility    | Required | Purpose                                                                                                                                                             |
| -------------------------------------- | ------------- | -------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | client/public |      yes | Supabase project URL.                                                                                                                                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client/public |      yes | Public Supabase key; direct client DB access is disabled by design (deny-by-default, no RLS policies — all data access is server-side via the service-role client). |

Values with `NEXT_PUBLIC_` are bundled into client code and must never contain secrets. Keep real environment files out of version control.
