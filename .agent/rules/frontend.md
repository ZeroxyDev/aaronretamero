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

## Accessibility

- Preserve semantic headings, links, buttons, and landmarks.
- Maintain readable contrast with the warm-dark palette.
- Make sure links and controls remain keyboard reachable.
