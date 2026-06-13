# Content And i18n Rules

## Messages

- All user-facing strings belong in `messages/<locale>/**.json`.
- Match message paths to component or page ownership:
  - `messages/es/components/feature/reflection/meta.json`
  - `messages/en/pages/home.json`
- Keep bundles aligned with filesystem ownership:
  - `components/layout/footer.tsx` -> `messages/<locale>/components/layout/footer.json`
  - `components/feature/home/intro.tsx` -> `messages/<locale>/components/feature/home/intro.json`
- Keep keys simple and explicit.
- Use ICU syntax when singular/plural or interpolation is needed.

## Locales

- Locale definitions come from `lib/i18n/config.ts`.
- Never hardcode locale codes, default locale, locale labels, or locale metadata outside locale config unless unavoidable in framework glue.
- Bundle registration lives in `lib/i18n/registry.ts`.
- Bundle loading must stay dynamic per bundle. Do not load the full locale dictionary when only a subset is needed.
- Use `pnpm add:locale` when introducing a brand new locale to the project.
- The locale CLI updates:
  - `lib/i18n/config.ts`
  - `lib/i18n/registry.ts`
  - `messages/<locale>/**.json`
  - `content/about/<locale>.mdx`
  - `content/reflections/<locale>/<year>/<month>/<slug>.mdx`
- The locale CLI asks for:
  - base locale
  - locale code
  - native language name
  - short label
  - metadata locale
  - text direction
  - overwrite behavior
  - whether to generate messages, about, and reflections
- The current defaults for a new locale are:
  - `nativeName`: inferred native language name
  - `shortLabel`: uppercased locale code, such as `CA`

## Reflections

- Reflection content lives in `content/reflections/<locale>/<year>/<month>/<slug>.mdx`.
- Every locale version of the same reflection must share the same frontmatter `id`.
- Shared fields across locales:
  - `id`
  - `date`
  - `time`
- Locale-specific fields:
  - `locale`
  - `title`
  - `slug`
  - `excerpt`
  - `tags`
  - `state`
  - body content
- Do not store `views`, `fragmentNumber`, or derived archive fields in frontmatter.
- `lib/reflections.ts` is the source of truth for reading, grouping, sorting, alternate locale lookup, adjacent reflections, and display-date formatting.
- Reflections are grouped by year in the landing archive and sorted by `date` plus `time` descending.

## Translation Workflow

- Use `pnpm translate:content` for automatic content translation.
- The CLI supports:
  - `reflection`
  - `about`
- The CLI asks for:
  - content type
  - base locale
  - reflection `id` when translating reflections
  - target locales
  - overwrite behavior
- The CLI writes translated files back into:
  - `content/reflections/<locale>/<year>/<month>/`
  - `content/about/<locale>.mdx`
- The translation workflow requires `OPENAI_KEY`.

## SEO

- Reuse `config/site.ts` and `lib/seo.ts`.
- Avoid page-level hardcoded metadata strings when an i18n key or site config key already exists.
