---
name: diseno-web
description: Úsala antes de cambiar cualquier cosa visual de esta web (tipografía, color, espaciado, componentes, cómo se ve una reflexión o una cita destacada). Resume el sistema visual real y remite a las reglas de .agent/.
---

# Diseño de la web

Fuente de verdad: `.agent/rules/frontend.md` y `.agent/skills/tailwind-editorial-ui/SKILL.md`. Esta skill resume el
estado real del código para no tener que buscarlo.

## Dirección

Editorial, silenciosa, cálida y oscura. Un archivo para leer, no un feed:

- sin tarjetas, sombras ni animación gratuita;
- sin likes, comentarios ni barras de compartir;
- antes espacio y tipografía que bordes.

La web va contra las métricas a propósito.

## Tokens (`app/globals.css`, `@theme inline`)

| Token | Valor | Uso |
|---|---|---|
| canvas | #1a1917 | fondo |
| surface | #322f28 | superficies |
| ink | #f8f7f4 | texto |
| muted | #ada28b | texto secundario, citas |
| border | #4f483b | líneas |

Solo modo oscuro (`color-scheme: dark`). Hay una única fuente variable (`public/font.woff2`) para sans y mono,
también en los canvas de las tarjetas compartidas.

## Cómo se ve una reflexión (`lib/markdown.tsx`)

- Párrafo: 1.08rem, interlineado 1.95, ink al 88 %. Un párrafo de una línea respira solo; no hace falta nada más.
- `> **frase**`: borde izquierdo fino, texto muted y negrita en ink. Es la cita destacada. Funciona porque es rara:
  entre 3 y 5 por reflexión.
- `##` existe, pero las reflexiones no usan encabezados. No los añadas.
- `---` se pinta como `<hr>`. Úsalo solo como pausa real, no como decoración.
- Las citas se comparten desde `components/feature/reflection/shareable-body.tsx` (cliente). Cualquier cambio visual de citas se
  comprueba también ahí.

## Verificar

Lo visual se decide viendo. Abre `pnpm dev` en el navegador integrado y enseña captura en escritorio y en móvil (375 px)
antes de dar nada por bueno. Tras 2–3 pruebas que no convencen, enseña la mejor y pregunta.
