# AGENTS.md

> Small operating contract for agents. Project intent lives in `CONTEXT.md`; task guidance is routed through `RULES.md`.

## Project

acd-ctf-system — ctf system for school competition

- Stack: `nextjs-supabase`
- Platform: `web`
- Architecture profile: `MEDIUM`

## Commands

- Install: `npm install` initially; use `npm ci` after committing the lockfile.
- Develop: `npm run dev`
- Validate: `npm run lint && npm run typecheck && npm run test --if-present && npm run build`
- End-to-end: `npm run test:e2e --if-present`
- Local database: `npm run supabase:start`, `npm run supabase:reset`, or `npx supabase db push --local`
- Spring backend, when present: `cd backend && ./mvnw --batch-mode test` (`mvnw.cmd` on Windows)

## Required workflow

1. Read `CONTEXT.md` and inspect neighboring implementation and tests.
2. Resolve conditional product-planning guidance when it applies.
3. Find the task concern in `RULES.md`; open only its linked playbook section.
4. State assumptions when product behavior is ambiguous.
5. Make the smallest coherent change and add risk-appropriate tests.
6. Run lint, typecheck, relevant tests, and a production build before completion.

## Product context

- If `CONTEXT.md` reports `Product status: incomplete`, use `RULES.md` to locate and follow product-onboarding guidance.
- If the user supplies or substantially changes a specification or plan, use `RULES.md` to locate and follow plan-reconciliation guidance.
- Otherwise, do not repeat product onboarding.

## Always-on constraints

- Treat browser code and browser-visible environment variables as public
- Preserve semantic HTML, keyboard access, and progressive failure behavior
- Server Components default; use client only where browser behavior is required
- Medium default: entry point → Service → owned Repository or remote API client

- Validate untrusted input at the server boundary.
- Authenticate and authorize separately; enforce authorization near data and side effects.
- Never expose server secrets through public environment prefixes or client modules.

## Authority boundaries

- Do not deploy, publish, merge, push, send messages, or modify production data unless explicitly asked.
- Do not delete user work or weaken tests/security controls to make a check pass.
- Prepare migrations locally and review them through the PR first. Apply migrations to hosted Supabase only after the PR is merged and the release target is explicitly confirmed.

## Definition of done

- Acceptance behavior works and has appropriate coverage.
- Validation commands pass, or the exact blocker is reported.
- Errors do not leak secrets, personal data, or internal details.
- Relevant architecture, API, and environment documentation is updated.

## Deviation policy

Agents may recommend alternatives, but must propose the change and receive explicit approval before changing the selected architecture, provider, authentication model, data boundary, production baseline, or major dependency. Record approved deviations and their rationale in `CONTEXT.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
