---
name: next-intl-bundles
description: Use when adding or changing user-facing copy, locale behavior, message bundles, translated metadata, or locale-aware routing in this project. Covers the repo's JSON-only message system, next-intl bundle registry, locale config, and no-hardcoded-copy rules.
---

# next-intl Bundles

## Use This Skill For

- Adding translated UI strings
- Registering new message bundles
- Updating locale-aware metadata or navigation
- Extending locale config or bundle loading
- Adding a brand new supported locale through the local CLI

## Non-Negotiables

- No user-facing text outside `messages/**.json`.
- No hardcoded locale codes where `lib/i18n/config.ts` already defines them.
- No hardcoded bundle lists inside components or layouts.
- No hardcoded singular/plural UI strings when ICU messages can express the rule.

## Message Placement

- Put copy in the bundle that owns the UI:
  - component copy -> `messages/<locale>/components/...`
  - page copy -> `messages/<locale>/pages/...`
  - site-level copy -> `messages/<locale>/common/...`
- Mirror the component tree in message paths whenever possible.

## Bundle Workflow

1. Add JSON files for every supported locale.
2. Register the bundle in `lib/i18n/registry.ts`.
3. Load copy through `getTranslator` or existing i18n helpers.
4. If adding route-level copy, make sure the consuming layout or component loads the right bundle.
5. Keep bundle loading granular so layouts and pages only load what they need.

## Locale Workflow

- Prefer `pnpm add:locale` when adding a brand new supported locale.
- The locale CLI updates `lib/i18n/config.ts`, `lib/i18n/registry.ts`, `messages/<locale>/**.json`, `content/about/<locale>.mdx`, and translated reflections when requested.
- Add locale definitions only in `lib/i18n/config.ts`.
- Keep locale metadata there, including default status and labels.
- Prefer deriving downstream behavior from config instead of branching manually.
- When locale-specific content exists outside messages, keep it keyed by shared content IDs rather than per-locale ad hoc identifiers.
- The current locale CLI defaults are:
  - `nativeName`: inferred native language name
  - `shortLabel`: uppercased locale code

## ICU Patterns

- Use ICU pluralization for counters such as views.
- Prefer translator-friendly message shapes over concatenated strings.
- Keep formatting logic outside messages only when it is truly presentational, such as date formatting through `Intl`.

## SEO And Config

- Prefer keys in `config/site.ts` for site identity and reusable metadata keys.
- Prefer `lib/seo.ts` helpers over one-off metadata composition.

## Validation

- Confirm every supported locale has the new keys.
- Run:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
