---
name: reflection-translation-cli
description: Use when creating or updating translated content files with the local OpenAI-powered CLI. Covers reflection and about translation flows, date-based reflection content, and the `pnpm translate:content` workflow.
---

# Content Translation CLI

## Use This Skill For

- Translating an existing reflection into one or more target locales
- Translating the about page into one or more target locales
- Understanding how locale variants of a reflection are connected
- Understanding how singleton content such as `about` is localized
- Updating the translation workflow or prompt behavior
- Reviewing the output path and frontmatter rules for translated content
- Understanding the difference between `pnpm translate:content` and `pnpm add:locale`

## Source Of Truth

- Reflections live at `content/reflections/<locale>/<year>/<month>/<slug>.mdx`.
- About content lives at `content/about/<locale>.mdx`.
- Every locale version of the same reflection shares the same frontmatter `id`.
- Shared fields across translations:
  - `id`
  - `date`
  - `time`
- Locale-owned fields:
  - `locale`
  - `pinned`
  - `title`
  - `slug`
  - `excerpt`
  - `tags`
  - `state`
  - Markdown body
- About locale variants use:
  - `locale`
  - `title`
  - `excerpt`
  - Markdown body

## CLI Workflow

1. Run `pnpm translate:content`.
2. Choose the content type: `reflection` or `about`.
3. Choose the base locale.
4. Choose the reflection by shared `id`, or confirm `about`.
5. Choose target locales or `all`.
6. Choose whether existing translations should be overwritten.
7. Review the generated `.mdx` files in the target locale folders.

## New Locale Workflow

1. Run `pnpm add:locale`.
2. Choose the base locale used as the translation source.
3. Enter the new locale code.
4. Confirm or edit the inferred native language name.
5. Confirm or edit the short label and metadata locale.
6. Choose text direction and overwrite behavior.
7. Choose whether to generate messages, about, and reflections.
8. Review the generated locale config, registry entries, message bundles, and content files.

## Environment

- The CLI requires `OPENAI_KEY`.
- The model defaults to `gpt-4.1-mini`.
- Override the translation model with `OPENAI_TRANSLATION_MODEL` when needed.

## Output Rules

- Preserve Markdown structure, headings, separators, and paragraph breaks.
- Preserve tone and cadence as faithfully as possible.
- Preserve the source reflection's `pinned` value in translated output.
- Generate a natural target-language `slug` in kebab-case for reflections.
- Write reflection output to `content/reflections/<target-locale>/<year>/<month>/<slug>.mdx`.
- Write about output to `content/about/<target-locale>.mdx`.
- Do not invent or mutate the shared reflection `id`.

## Validation

- Confirm the translated file has valid frontmatter.
- Confirm reflection paths match the reflection date and translated slug.
- Confirm about paths match `content/about/<locale>.mdx`.
- Confirm the shared `id` matches the source reflection when translating reflections.
- If the translation changes UI-facing metadata that is echoed elsewhere, verify the site still resolves the reflection correctly.
