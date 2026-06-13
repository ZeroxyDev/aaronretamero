# Frontend Rules

## Visual Direction

- The site is minimal, quiet, editorial, and warm-dark.
- Avoid app-like UI, dashboards, cards with heavy chrome, or social/product tropes.
- Do not add unnecessary animation. Prefer no motion over decorative motion.

## Tailwind

- Use Tailwind v4 utilities consistently.
- Reuse existing design tokens from `app/globals.css`.
- Prefer spacing and typography changes over borders, shadows, or visual effects.
- Keep layouts breathable but compact where the product already trends compact.

## Components

- Use server components by default.
- Only use client components when browser APIs, effects, or interaction require them.
- Keep view-specific composition in route files and reusable display logic in `components/feature/**`.
- Reflection quote sharing is intentionally a client-only feature because it uses selection, canvas, clipboard, download, and Web Share APIs.
- Keep quote sharing scoped to `components/feature/reflection/shareable-body.tsx`; preserve the split between selection handling, floating share UI, persistent highlight, and share-card rendering.
- The generated share card should remain editorial and quiet: vertical story format, selected quote emphasized, nearby context blurred only inside the generated image, and a localized footer with reflection title, author, and site domain.

## Accessibility

- Preserve semantic headings, links, buttons, and landmarks.
- Maintain readable contrast with the warm-dark palette.
- Make sure links and controls remain keyboard reachable.
