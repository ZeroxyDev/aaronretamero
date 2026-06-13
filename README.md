# Aaron Retamero

A multilingual editorial website built with Next.js App Router, `next-intl`, local MDX content, and Prisma-backed reflection view tracking.

The site is structured as a small archive-first publication:

- The home page is a chronological archive of reflections.
- Each reflection is stored as a local MDX document.
- The about page is also stored as local MDX content.
- UI copy is translated through locale JSON bundles.
- Reflection views are tracked in PostgreSQL per reflection and per visitor.
- New locales and translated content can be generated through local OpenAI-powered CLI scripts.

## What This Project Does

This repository powers a content-first personal site with three main layers:

1. Presentation layer
   A Next.js 16 App Router app renders the archive, reflection pages, the about page, metadata, sitemap, robots rules, and an interactive locale switcher.

2. Content layer
   Reflections and the about page live in the repository as MDX files under `content/`, so editorial content is versioned alongside code.

3. Operations layer
   Prisma and PostgreSQL store view counters, while local CLI scripts handle translation workflows and new locale setup using the OpenAI Responses API.

## Stack

- Next.js 16.2.9
- React 19
- TypeScript
- Iconify + Solar icons
- `next-intl`
- Prisma 7
- PostgreSQL
- Tailwind CSS 4
- Local MDX content

## Project Structure

```text
app/                 Next.js routes, layouts, metadata, API routes
components/          UI and feature components
config/              Site-wide configuration
content/             Local MDX content
lib/                 i18n, SEO, content parsing, database helpers, API helpers
messages/            Locale JSON bundles for UI copy
prisma/              Prisma schema
scripts/             Translation and locale setup CLIs
```

Important content locations:

- `content/reflections/<locale>/<year>/<month>/<slug>.mdx`
- `content/about/<locale>.mdx`
- `messages/<locale>/**/*.json`
- `lib/i18n/config.ts`
- `lib/i18n/registry.ts`

## How The Site Is Organized

### Archive and reflection pages

- `app/[locale]/page.tsx` renders the reflection archive for a locale.
- `app/[locale]/reflexiones/[slug]/page.tsx` renders an individual reflection.
- Reflections are grouped and resolved from local MDX files in `lib/reflections.ts`.
- Alternate locale URLs for the same reflection are derived from the shared reflection `id`.

### Shareable reflection quotes

- Reflection pages support selecting text inside the article body and sharing that selection as an image.
- The feature lives in `components/feature/reflection/shareable-body.tsx` and is used through `components/feature/reflection/body.tsx`.
- The on-page interaction keeps the selected phrase visually highlighted and shows a compact floating share control near the selection.
- The generated image is a vertical 9:16 story-style PNG. It keeps nearby context in the original order, renders the selected phrase clearly, blurs surrounding context, and adds a localized editorial footer.
- Sharing uses the browser Web Share API when file sharing is available. If not, the image is downloaded and the selected text is copied when clipboard access is available.
- Footer copy and share UI strings live in `messages/<locale>/pages/reflection.json`; site identity comes from `config/site.ts`.

### About page

- `app/[locale]/sobre-mi/page.tsx` renders the localized about page.
- About documents live in `content/about/<locale>.mdx`.

### Internationalization

- Locale definitions live in `lib/i18n/config.ts`.
- Routing is configured through `next-intl` in `lib/i18n/routing.ts`.
- UI messages are loaded per bundle from `messages/<locale>/...`.
- The locale switcher uses each locale's `nativeName`.
- UI icons are centralized through a small Solar icon registry in `components/ui/icons.tsx` and rendered through `components/ui/ui-icon.tsx`.

### Footer source link

- The footer includes a source-code link driven by `siteConfig.social.sourceUrl`.
- The link label is localized through the `components.layout.footer` message bundle.
- The visual icon for that link uses the Solar icon set.

### Reflection view tracking

- A client-side tracker posts to `POST /api/reflections/views`.
- The API route stores a visitor cookie and records unique views per `entryId + visitorId`.
- View totals are stored in PostgreSQL through Prisma models:
  - `ReflectionView`
  - `ReflectionViewVisitor`

If `DATABASE_URL` is not configured, the site still runs, but persistent view tracking is effectively disabled.

## Prerequisites

Before starting, make sure you have:

- Node.js 20.9 or newer
- `pnpm`
- A PostgreSQL database if you want persistent reflection view tracking
- An OpenAI API key if you want to use the translation and locale-generation scripts

## Environment Variables

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

Environment variables used by this project:

- `DATABASE_URL`
  PostgreSQL connection string used by Prisma and runtime view tracking.
  Optional for basic page rendering, but required for database-backed view counts and any Prisma schema push.

- `OPENAI_KEY`
  Required for:
  - `pnpm translate:content`
  - `pnpm add:locale`

- `OPENAI_TRANSLATION_MODEL`
  Optional override for the translation model used by the scripts.
  Defaults to `gpt-5-mini`.

The translation scripts load `.env.local` first and then `.env`.

## Local Setup From Scratch

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create your environment file

```bash
cp .env.example .env.local
```

Fill in at least:

- `DATABASE_URL` if you want the database features enabled
- `OPENAI_KEY` if you want translation tooling enabled

### 3. Generate Prisma client

```bash
pnpm prisma:generate
```

### 4. Push the Prisma schema to PostgreSQL

```bash
pnpm prisma:push
```

This project currently uses `prisma db push` rather than a committed migration history, so schema application is based on `prisma/schema.prisma`.

### 5. Start the development server

```bash
pnpm dev
```

Open `http://localhost:3000`. The app will redirect to the default locale route.

## PostgreSQL Setup

The app expects a standard PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

You can use any PostgreSQL provider that gives you a compatible connection string, such as:

- Neon
- Supabase
- Railway
- Render
- AWS RDS
- A self-hosted PostgreSQL server

### Recommended minimum for production

- A persistent PostgreSQL instance
- SSL enabled if your provider requires or supports it
- Credentials with read/write access to the application database

### What the database is used for

At the moment, PostgreSQL is used for one operational feature:

- Reflection view counters with visitor deduplication

The content itself is not stored in the database. Reflections and about pages remain file-based under `content/`.

## Available Commands

### App lifecycle

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

### Database

```bash
pnpm prisma:generate
pnpm prisma:push
```

### Content and locale tooling

```bash
pnpm translate:content
pnpm add:locale
```

## Content Model

### Reflection documents

Reflections are stored as MDX with frontmatter. Locale variants of the same reflection must share the same `id`.

Shared fields across locale variants:

- `id`
- `date`
- `time`

Locale-owned fields:

- `locale`
- `pinned`
- `title`
- `slug`
- `excerpt`
- `tags`
- `state`
- body content

Pinned reflections:

- Can be marked with `pinned: true` in frontmatter.
- Are surfaced above the archive in a dedicated timeline-style block.
- Are limited to the 3 most recent pinned entries, ordered by `date` and `time` descending.
- Are not repeated again inside the year-grouped archive list.

### About documents

About pages are stored in `content/about/<locale>.mdx` and include:

- `locale`
- `title`
- `excerpt`
- body content

## Translation Workflow

### Translate existing content

Run:

```bash
pnpm translate:content
```

The CLI supports:

- `reflection`
- `about`

It asks for:

- content type
- base locale
- reflection `id` when translating reflections
- target locales
- overwrite behavior

Output is written back into:

- `content/reflections/<locale>/<year>/<month>/`
- `content/about/<locale>.mdx`

The translation flow preserves shared editorial metadata such as `id`, `date`, `time`, and `pinned`.

### Add a brand new locale

Run:

```bash
pnpm add:locale
```

The CLI updates locale-related project files and can generate translated content for the new locale.

It asks for:

- base locale
- locale code
- native language name
- short label
- metadata locale
- text direction
- overwrite behavior
- whether to generate messages
- whether to generate about content
- whether to generate reflections

Depending on your choices, it updates:

- `lib/i18n/config.ts`
- `lib/i18n/registry.ts`
- `messages/<locale>/**.json`
- `content/about/<locale>.mdx`
- `content/reflections/<locale>/<year>/<month>/<slug>.mdx`

When a reflection is translated through this flow, the source reflection's `pinned` value is preserved in generated locale variants.

## Deployment

This app can be deployed to any platform that can:

- run a Next.js Node server
- expose environment variables
- connect to PostgreSQL

Two common approaches are described below.

### Option 1: Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Set the environment variables:
   - `DATABASE_URL`
   - `OPENAI_KEY` if you will run translation scripts in that environment
   - `OPENAI_TRANSLATION_MODEL` if you want a non-default model
4. Install dependencies with `pnpm`.
5. Make sure Prisma client is generated during build if needed.
6. Run `pnpm prisma:push` against the production database before first traffic, or as part of your deployment workflow.
7. Deploy.

Recommended Vercel notes:

- Use a managed PostgreSQL provider.
- Keep `siteConfig.url` aligned with the production domain.
- If you only translate content locally, `OPENAI_KEY` does not need to be present in production.

### Option 2: Self-hosted Node deployment

1. Provision a PostgreSQL database.
2. Clone the repository on your server.
3. Install Node.js 20.9+ and `pnpm`.
4. Run:

```bash
pnpm install
pnpm prisma:generate
pnpm build
```

5. Set environment variables on the server:
   - `DATABASE_URL`
   - `OPENAI_KEY` only if the host will run translation scripts
   - `OPENAI_TRANSLATION_MODEL` if desired
6. Apply the schema:

```bash
pnpm prisma:push
```

7. Start the app:

```bash
pnpm start
```

8. Put the Node process behind a reverse proxy such as Nginx, Caddy, or your platform's router.

## Production Checklist

- `DATABASE_URL` points to the correct production PostgreSQL database
- Prisma schema has been pushed to that database
- `siteConfig.url` matches the public domain
- The app builds successfully with `pnpm build`
- Locale content exists for the locales you want to expose
- Message bundles exist for every supported locale

## Validation

Useful validation commands:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Run `pnpm prisma:push` whenever the Prisma schema changes and your target database needs to be updated.

## Notes For Operators

- This project is content-driven first. Most editorial updates happen in `content/` and `messages/`.
- Database usage is intentionally small and focused on view tracking.
- OpenAI usage is limited to local authoring workflows, not user-facing runtime requests.
- Adding a locale is more than adding translation files; the safest path is `pnpm add:locale`.

## License

Add a license section here if you plan to publish or distribute the repository.
