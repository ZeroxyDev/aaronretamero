# Architecture Rules

## Core Shape

- Use `Next.js App Router` only.
- Keep server concerns in `app`, `lib`, and server-safe utilities. Do not move backend logic into client components.
- Prefer small declarative files over large mixed-purpose modules.

## Project Structure

- `app/`: routes, layouts, metadata, route handlers.
- `components/layout/`: shell and structural UI.
- `components/ui/`: reusable low-level UI primitives.
- `components/feature/`: domain-facing UI grouped by feature.
- `lib/api/`: project HTTP client and route handler helpers only.
- `lib/db/`: Prisma wrapper and domain actions only.
- `lib/i18n/`: locale config, registry, server helpers, navigation.
- `config/`: site-wide config, paths, cookie names, SEO keys.
- `messages/`: all user-facing copy as locale JSON bundles.
- `content/`: local reflection content grouped by locale and publication date.

## Hard Rules

- Do not hardcode user-facing text outside `messages/**`.
- Do not hardcode locale lists, bundle lists, cookie names, or site identity where config already exists.
- Prefer extending `config/site.ts` and `lib/i18n/config.ts` rather than duplicating values.
- Keep naming declarative: `components/feature/reflection/meta.tsx`, not vague utility names.
- Avoid architectural drift: if a pattern already exists for config, i18n, API, or DB, extend that pattern instead of adding a parallel one.
- Reflection source files live at `content/reflections/<locale>/<year>/<month>/<slug>.mdx`.
- Locale variants of the same reflection must share the same frontmatter `id`.
- Reflection frontmatter should use `id`, `locale`, `title`, `slug`, `date`, `time`, `excerpt`, `tags`, and `state`.
- Do not reintroduce legacy reflection fields such as `entryId`, `fragmentNumber`, or frontmatter-level `views`.

## Adding New Work

- New UI copy: add a JSON key in the correct `messages/<locale>/...` bundle and register the bundle if needed.
- New DB behavior: add generic capability in `lib/db/db-actions.ts` only if needed, then expose intent in `lib/db/domain-actions.ts`.
- New API endpoint: use `lib/api/handler.ts` for shared behavior and keep route handlers thin.
- New site-wide constants: add them to `config/site.ts`.
- New reflections: create one file per locale under the date-based tree and keep the shared `id` stable across translations.
- New content translations: use `pnpm translate:content` instead of manual copy-paste when possible.

## Validation

- Default validation commands:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
- Do not run `next build` unless explicitly requested.
