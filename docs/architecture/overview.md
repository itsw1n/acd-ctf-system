# Architecture Overview

## Runtime shape

- Frontend: Next.js
- Backend/data: Supabase
- Platform: web
- Architecture profile: medium
- Styling mode: tailwind
- Authentication: custom password accounts (alias + Argon2id, sessions, recovery codes) — see `auth-flow.md`

## Generated source map

This map is derived from the runnable source, routes, migrations, and tests generated for this
specific stack and architecture profile. Tooling, deployment, and guidance files are omitted.

```text
acd-ctf-system/
├── src/
│   ├── app/
│   │   ├── (ctf)/            protected: dashboard, leaderboard, activity, profile
│   │   ├── signin/ signup/ forgot-password/
│   │   ├── globals.css       Tailwind import, @theme tokens, base rules
│   │   ├── layout.tsx        Oxanium + JetBrains Mono via next/font
│   │   └── page.tsx          redirects by session (→ /dashboard or /signin)
│   ├── components/
│   │   ├── common/           Button, Input, TacticalPanel (shared primitives)
│   │   └── layout/           AppShell, Navigation, Topbar, Container, Section
│   ├── features/
│   │   ├── auth/             schemas, services, actions, forms
│   │   ├── players/          team/player repositories, types
│   │   ├── sessions/         session repository + service
│   │   ├── flags/            submission schema, service, repository, form
│   │   ├── leaderboard/      ranking queries
│   │   └── activity/         solve-history queries
│   ├── config/               server-only env validation
│   ├── lib/                  cn(), security (hash, rate-limit boundary),
│   │                         supabase admin client
│   └── test/                 vitest setup
├── e2e/                      Playwright auth + access flows
├── scripts/                  hash-flag.mjs
└── supabase/
    ├── migrations/           001 schema + RLS, 002 password auth
    ├── seed.sql              local-only demo data
    └── config.toml
```

The map above reflects the current tree; the original generated map is
superseded. Entry points stay thin (routing + composition), validation happens
at trust boundaries (zod schemas in server actions), and authorization is
enforced beside protected data (`requireCurrentPlayer`) and side effects.

## Detailed structure rules

- `playbooks/stack/nextjs/structure.md`

The structure playbooks show available destinations and profile growth rules. Create a folder only
when its responsibility exists. Before an agent removes or reorganizes user-created architecture,
it must explain the change, future placement, and recovery path and then ask for approval.

## Verification boundary

The starter is considered healthy when its lint/typecheck/tests/build commands pass.
Documentation explains those executable patterns; it does not override working code and tests.
