---
name: reflection-content-seo
description: Use when working on reflections, archive timelines, reflection metadata, local Markdown content, sitemap behavior, or page metadata in this project. Covers the local content model, reflection page structure, and the site's archive-first editorial SEO approach.
---

# Reflection Content SEO

## Use This Skill For

- Editing reflection content structure
- Adding or updating reflection metadata
- Changing archive/reflection page presentation
- Updating sitemap or metadata behavior tied to reflections

## Content Model

- Content lives in `content/reflections/<locale>/<year>/<month>/<slug>.mdx`.
- Keep the shared `id` aligned across locales for the same reflection.
- Keep `date` and `time` aligned across locales for the same reflection.
- Treat `pinned`, `slug`, `title`, `excerpt`, `tags`, `state`, and body as locale-owned fields.
- Reflection file placement should follow its publication year and month.
- Reflection pages should feel like dated archive entries, not blog posts or social content.

## Reflection UX Rules

- Keep the reading experience text-first and uncluttered.
- Reflection metadata should stay compact and meaningful.
- Do not add likes, comments, share bars, newsletters, or reading-time fluff unless explicitly requested.

## SEO Rules

- Use `lib/seo.ts` helpers.
- Reuse `config/site.ts` metadata keys.
- Keep sitemap and robots dynamic where content/config already exists.
- Alternate-locale SEO should derive from the shared reflection `id`, not from filename assumptions.

## Archive Rules

- The archive is a chronological text list, not a card feed.
- Views, date, and title should remain subordinate to reading flow.
- Keep list density intentional and minimal.
- Landing grouping is by year, with each entry rendered as a compact text row.
- Pinned reflections may appear above the dated archive in a dedicated timeline-style block.
- Show at most 3 pinned reflections, ordered newest-first by `date` plus `time`.
- Do not render pinned reflections a second time inside the dated archive list.

## Translation Workflow

- Prefer `pnpm translate:content` when creating locale variants from an existing reflection.
- The generated translation must preserve:
  - shared `id`
  - `date`
  - `time`
  - `pinned`
  - Markdown structure
- After translation, review the target `slug` and editorial tone before publishing.

## Validation

- Check that new reflections work in both locale routes.
- Run:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
