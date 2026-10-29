---
name: arquitectura-web
description: Úsala antes de tocar código, contenido o rutas de esta web (Next.js 16 + Markdown local + next-intl es/en/ca). Resume cómo se cargan las reflexiones, qué rompe el parser y cómo verificar un cambio. Remite a las reglas de .agent/ en vez de duplicarlas.
---

# Arquitectura de la web

Fuente de verdad: `.agent/rules/architecture.md`, `.agent/rules/content-and-i18n.md` y las skills de `.agent/skills/`
(`reflection-content-seo`, `next-intl-bundles`, `reflection-translation-cli`, `prisma-domain-api`). Léelas por rangos
cuando toques su área. Esta skill solo añade lo que no está escrito allí.

## Mapa rápido

- Stack: Next 16 (App Router), React 19, TypeScript, Tailwind 4, next-intl 4, react-markdown + remark-gfm, Prisma 7
  (solo contador de vistas). Gestor: `pnpm`.
- Rutas: `app/[locale]/page.tsx` (archivo), `app/[locale]/reflexiones/[slug]/page.tsx`, `app/[locale]/sobre-mi/`.
- Contenido: `content/reflections/<locale>/<año>/<mes>/<archivo>.mdx`. Se lee en `lib/reflections.ts` con el parser
  casero de `lib/content.ts`.
- UI: cadenas solo en `messages/<locale>/…`, nunca en el código.

## Lo que el parser NO te avisa

El `.mdx` no es MDX: se renderiza como Markdown con react-markdown. JSX o imports no funcionan.

- No hay validación. Un campo que falta sale como la cadena `"undefined"`.
- El frontmatter empieza en la línea 1 con `---` y cierra con `---` exacto. Nada de línea en blanco inicial ni de
  `------` (la de agosto funciona por casualidad y mete un `<hr>` al principio).
- `tags` va en una sola línea, `["a", "b"]`, y sin comas dentro de un tag.
- `id`, `date` y `time` son idénticos en los tres idiomas: así se emparejan las traducciones. Un `id` repetido en el
  mismo idioma pisa al otro sin avisar.
- `slug` es por idioma y único. La URL sale del `slug`, no del nombre de archivo.
- La carpeta `año/mes` coincide con `date`.
- Convención de `id`: `AAAA-MM-DD-<slug-es>`.

## Verificar

0. Si falta `node_modules`, ejecuta `pnpm install --frozen-lockfile` y después `pnpm prisma:generate`. pnpm ignora el
   script de build de Prisma, así que sin el segundo paso la web da error 500 con «Cannot find module
   '.prisma/client/default'». El servidor se arranca con `preview_start` y el nombre `web` (`.claude/launch.json`).
1. `pnpm lint` y `pnpm exec tsc --noEmit`. No validan contenido.
2. Contenido: `pnpm dev` y abrir `/es/reflexiones/<slug>` (y `/en`, `/ca` si existen). Es la prueba barata.
3. `pnpm build` solo si Aaron lo pide (regla del proyecto); es la única que valida todo el contenido.

Nunca digas «hecho» sin el paso 2.

## Límites

- No borrar, mover ni pisar archivos fuera de temporales sin permiso.
- Sin commit ni push salvo que lo pida. Sin desplegar.
