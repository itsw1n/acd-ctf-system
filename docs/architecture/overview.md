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
│   │   ├── (ctf)/            protected: challenges, leaderboard, activity, profile, admin
│   │   ├── signin/ signup/ forgot-password/
│   │   ├── globals.css       Tailwind import, @theme tokens, base rules
│   │   ├── layout.tsx        Oxanium + JetBrains Mono via next/font
│   │   └── page.tsx          public team/player leaderboard
│   ├── components/
<<<<<<< HEAD
│   │   ├── common/           Button, Input, TacticalPanel (shared primitives)
│   │   └── layout/           AppShell, Navigation, Topbar, Container, Section
=======
│   │   ├── common/           Button, Input, Select, Modal, TacticalPanel (shared primitives)
│   │   └── layout/           AppShell, PublicHeader, Navigation, Topbar, Container, Section
>>>>>>> 4c676ee (docs: align project guidance with current ctf flow)
│   ├── features/
│   │   ├── auth/             schemas, services, actions, forms
│   │   ├── players/          account lock, filters, repositories, types
│   │   ├── sessions/         session repository + service
│   │   ├── flags/            submission schema, service, repository, form
│   │   ├── leaderboard/      team/player ranking queries
│   │   ├── challenges/       challenge board, metadata, admin CRUD
│   │   ├── competition/      competition-wide access lock
│   │   └── activity/         solve-history queries
│   ├── config/               server-only env validation
│   ├── lib/                  cn(), security (hash, rate-limit boundary),
│   │                         supabase admin client
│   └── test/                 vitest setup
├── e2e/                      Playwright auth + access flows
├── scripts/                  hash-flag.mjs
└── supabase/
    ├── migrations/           001–010 ordered schema and access changes
    ├── seed.sql              local-only demo data
    └── config.toml
```

The map above reflects the current tree; the original generated map is
superseded. Entry points stay thin (routing + composition), validation happens
at trust boundaries (zod schemas in server actions), and authorization is
enforced beside protected data (`requireCurrentPlayer`) and side effects.

## Detailed structure rules

- `src/app/` contains route entrypoints and page composition only.
- Feature-owned UI lives under `src/features/*/components`.
- Reusable primitives live under `src/components/common`.
- App and public shell pieces live under `src/components/layout`.

The structure playbooks show available destinations and profile growth rules. Create a folder only
when its responsibility exists. Before an agent removes or reorganizes user-created architecture,
it must explain the change, future placement, and recovery path and then ask for approval.

## Verification boundary

The starter is considered healthy when its lint/typecheck/tests/build commands pass.
Documentation explains those executable patterns; it does not override working code and tests.
