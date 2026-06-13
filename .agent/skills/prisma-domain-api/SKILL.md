---
name: prisma-domain-api
description: Use when editing database behavior, Prisma schema, domain actions, API routes, or data persistence in this project. Covers the repo's simple db-actions plus domain-actions pattern, Prisma 7 adapter setup, and thin route-handler conventions.
---

# Prisma Domain API

## Use This Skill For

- Editing Prisma models
- Changing `lib/db/db-actions.ts`
- Adding or updating `lib/db/domain-actions.ts`
- Building route handlers backed by DB logic

## Architecture Pattern

- `lib/db/db-actions.ts`
  - generic Prisma access wrapper
  - no product-specific naming
  - reusable CRUD primitives
- `lib/db/domain-actions.ts`
  - business intent and domain-level operations
  - thin, explicit, declarative sections per model/domain
- `lib/api/handler.ts`
  - shared route error handling and JSON response shape
- `app/api/**/route.ts`
  - thin endpoints that validate input and delegate

## Prisma Rules

- Keep schema minimal and intentional.
- Prefer straightforward models over speculative event/outbox systems unless requested.
- This repo uses Prisma 7 with `@prisma/adapter-pg`, so preserve adapter-based initialization in `db-actions.ts`.
- Avoid instantiating Prisma eagerly in a way that breaks module evaluation.

## DB Change Workflow

1. Update `prisma/schema.prisma`.
2. Update domain behavior in `lib/db/domain-actions.ts`.
3. Regenerate Prisma client if schema changed.
4. Update route handlers and UI consumers.

## Validation

- After schema changes:
  - `pnpm exec prisma generate --schema prisma/schema.prisma`
- After code changes:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`

## Notes For Views

- Reflection views are deduplicated by visitor cookie plus reflection entry.
- Cookie names and site-level identifiers should come from `config/site.ts`, not route-local strings.
