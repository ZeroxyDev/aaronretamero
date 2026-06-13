---
name: tailwind-editorial-ui
description: Use when editing UI, layout, typography, spacing, or visual hierarchy in this project. Applies the site's warm-dark editorial Tailwind system, minimal interaction style, declarative component structure, and compact-but-breathable composition rules.
---

# Tailwind Editorial UI

## Use This Skill For

- Refining page layout, spacing, typography, and hierarchy
- Building new feature UI in `components/layout`, `components/ui`, or `components/feature`
- Keeping the product minimal instead of app-like

## Project Expectations

- Prefer server components unless interaction requires client code.
- Use existing tokens from `app/globals.css`.
- Preserve the project font contract: `Site Font` is loaded from `/font.woff2`, spans weights `100 900`, uses `font-style: normal`, and is rendered with `font-variation-settings: "slnt" 0`.
- Any generated image or canvas text should use the same `Site Font` and wait for the font to load before drawing.
- Keep the site visually quiet: no loud gradients, heavy shadows, startup cards, or decorative animation.
- Preserve the established component structure:
  - `components/layout/*`
  - `components/ui/*`
  - `components/feature/<feature>/*`

## Tailwind Workflow

1. Inspect nearby components before adding new patterns.
2. Reuse existing text sizes, tracking, leading, and muted color usage where possible.
3. Prefer solving design issues with:
   - spacing
   - max-width
   - alignment
   - typography
4. Only add borders or effects when they already fit the page language.

## Styling Heuristics

- Titles should feel dense and intentional.
- Metadata should read secondary but remain legible.
- Archive rows should stay lightweight and text-led.
- Reflection pages should prioritize reading flow over navigation chrome.
- Quote sharing should feel like an editorial affordance, not a social widget. Keep the floating control compact, translucent, and anchored to the selected text.
- When adjusting the share image, preserve the 9:16 story format, a clear selected quote, subdued blurred context, and the three-line footer hierarchy.
- Keep the on-page persistent highlight readable and unblurred so users can still see exactly what they are sharing.

## Avoid

- New design systems inside the app
- Reintroducing big headers or heavy footers
- Motion libraries or movement-based hover effects
- Generic card grids when a list or text layout is enough

## Validation

- Check both mobile and desktop mentally while editing.
- Run:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit`
