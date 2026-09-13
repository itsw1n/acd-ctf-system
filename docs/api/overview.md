# API Overview

This project exposes **no browser-callable HTTP API**. All mutations and all
authenticated reads go through Next.js Server Actions and Server Components,
which use the service-role client on the server only.

Authentication and authorization behavior is documented in
`docs/architecture/auth-flow.md`. Server actions are listed in
`docs/api/endpoints.md` in the same change that adds them, and their failure
messages in `docs/api/errors.md`.
