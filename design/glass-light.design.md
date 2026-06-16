---
version: anydesign-1
name: Warm Light Glassmorphism — Legal Dashboard (ref. "Dell Lawyer")
source: local image (captura compartida por el usuario, dashboard "Peter Malby / Dell Lawyer")
captured_at: 2026-06-16
description: |
  Dashboard de productividad legal en glassmorphism CALIDO y CLARO. El lienzo es un
  degradado crema-durazno; sobre el flotan tarjetas translucidas de blanco-roto calido
  con sombras muy suaves y esquinas grandes. Minimalista, aireado, humano. Un unico acento
  naranja conduce la accion, con verde/rojo solo para feedback (tendencias, flechas).
  Tipografia sans geometrica, numeros grandes en bold, etiquetas en mayuscula tracking.

colors:
  canvas-from: "#F2C29A"
  canvas-to: "#FBF1E6"
  surface: "#FCF6EE"
  surface-translucent: "rgba(255,251,245,0.62)"
  surface-2: "rgba(255,255,255,0.50)"
  text-primary: "#211C17"
  text-muted: "#9C9089"
  border: "#ECE1D4"
  accent: "#F2890F"
  success: "#33C36A"
  danger: "#F2473B"
  info: "#4B86F0"
  purple: "#8B5CF6"

typography:
  display:
    fontFamily: "Inter, 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.05
  heading:
    fontFamily: "Inter, 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 700
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 600
    letterSpacing: 0.06em
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400

spacing:
  base: 4px
  scale: [4, 8, 12, 16, 20, 24, 32, 40]

rounded:
  sm: 10px
  md: 14px
  lg: 22px
  pill: 9999px

shadow:
  soft: "0 10px 30px rgba(180,120,70,0.10)"
  lift: "0 16px 40px rgba(180,120,70,0.16)"

components:
  card:
    backgroundColor: "{colors.surface-translucent}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: 22px
  stat-card:
    backgroundColor: "{colors.surface-translucent}"
    rounded: "{rounded.lg}"
    padding: 20px
  sidebar-item:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: 11px 14px
  search-bar:
    backgroundColor: "{colors.surface-2}"
    rounded: "{rounded.md}"
    padding: 12px 18px
  pill-priority:
    backgroundColor: "transparent"
    border: "1px solid {colors.success}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  add-button:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: 8px
  table-row:
    backgroundColor: "transparent"
    border: "0 0 1px 0 solid {colors.border}"
    rounded: "0px"
    padding: 12px 0
---

# Design Analysis — Warm Light Glassmorphism (ref. "Dell Lawyer")

> Analysis generated with the `anydesign` skill.
> Date: 2026-06-16
> Analysis emphasis: reconstruction + design system (para adaptar a NOCTURA)

---

## Source

- **Source type**: local image
- **Path / URL**: captura compartida en chat (dashboard legal "Peter Malby / Dell Lawyer")
- **Capture method**: direct vision
- **Detected limitations**: solo desktop, un viewport; sin acceso a CSS/HTML (hex inferidos por vision, ⚠️ medium).

---

## TL;DR

Glassmorphism **calido y claro**: lienzo en degradado crema-durazno con tarjetas translucidas de blanco-roto, sombras muy suaves y radios grandes. Un solo acento naranja `{colors.accent}` (#F2890F) para la accion; verde/rojo solo para feedback. Insight accionable: el look se reconstruye casi entero con 3 piezas — el **degradado calido del fondo**, el **vidrio translucido calido** de las tarjetas y la **sombra difusa calida** (no gris).

---

## 1. Visual identity

### 1.1 Surface description

**Personality**: calido, aireado, minimalista, humano, premium-suave.
**Mood**: calma productiva — un panel de trabajo que se siente acogedor, no corporativo-frio.
**Detectable references**: glassmorphism "Apple/visionOS" en clave clara + dashboards tipo Linear/Notion suavizados con paleta calida.
**Information density**: balanceada (mucho dato, pero con aire generoso).
**Implicit positioning**: profesionales (abogados) que quieren control sin estres visual.
**Confidence**: ✅ high

### 1.2 Brand voice / Atmosphere

El diseno cree que su usuario vive en datos pesados (casos, plazos, prioridades) y que la interfaz debe **bajar la tension**, no sumarla. Por eso el lienzo es calido y no blanco clinico: el durazno comunica cercania y descanso visual, mientras el vidrio translucido hace que ninguna tarjeta "grite" — todo flota a la misma altura suave. La jerarquia no se logra con bordes duros ni color saturado, sino con **tamano tipografico** (numeros enormes) y **un unico acento** que se reserva para lo accionable.

El verde y el rojo no son decorativos: son el lenguaje del *feedback* (subio/bajo, aprobado/urgente). Esa disciplina — un acento de marca + dos semaforos — es lo que mantiene el panel legible aunque este lleno. La marca apuesta a que la elegancia es **restriccion calida**: pocos colores, mucho aire, sombras que se sienten como luz y no como peso.

### 1.3 The "ONE brand thing"

- **The thing**: el **lienzo de degradado calido crema-durazno** sobre el que flota todo en vidrio translucido.
- **Why it carries the brand**: si lo cambias por blanco/gris plano, se vuelve un dashboard generico; el calor del fondo + la translucidez ES la identidad.
- **How everything else supports it**: tarjetas casi sin borde, sombras difusas calidas (no grises), acento unico — todo restringido para que el fondo calido respire.
- **Where it appears**: en todo el lienzo de la app; nunca se reemplaza por un color plano.

*Confidence*: ✅ high

---

## 2. Design System (tokens)

### 2.1 Colors

| Token | Hex | Role | Where it appears | Confidence |
|---|---|---|---|---|
| `canvas-from` | `#F2C29A` | Fondo (esquinas calidas) | Degradado del lienzo | ⚠️ medium |
| `canvas-to` | `#FBF1E6` | Fondo (centro crema) | Degradado del lienzo | ⚠️ medium |
| `surface` | `#FCF6EE` | Superficie solida equivalente | Tarjetas (fallback opaco) | ⚠️ medium |
| `surface-translucent` | `rgba(255,251,245,0.62)` | Vidrio calido | Tarjetas, paneles | ✅ high |
| `surface-2` | `rgba(255,255,255,0.50)` | Vidrio mas claro | Inputs, search, item activo | ⚠️ medium |
| `text-primary` | `#211C17` | Texto principal | Numeros, nombres, titulos | ✅ high |
| `text-muted` | `#9C9089` | Texto secundario | Labels, metadatos | ✅ high |
| `border` | `#ECE1D4` | Hairline calido | Bordes/divisores tenues | ⚠️ medium |
| `accent` | `#F2890F` | Accion / marca | Logo, botones +, item activo, avatar PF | ✅ high |
| `success` | `#33C36A` | Feedback positivo | +14,88%, flechas arriba, sparkline verde | ✅ high |
| `danger` | `#F2473B` | Feedback negativo / urgente | -5,67%, flechas abajo, punto de notificacion | ✅ high |
| `info` | `#4B86F0` | Evento/categoria | Punto de calendario | ⚠️ medium |
| `purple` | `#8B5CF6` | Avatar/categoria | Avatar "LA", bullet patent | ⚠️ medium |

Dark mode: no observado (el diseno es light-only).

### 2.2 Typography

- **Detected family**: `Inter` o `Plus Jakarta Sans` *(⚠️ medium — inferido por vision; rasgos humanistas redondeados)*
- **Suggested fallback**: `system-ui, sans-serif`

| Token | Size | Weight | Use |
|---|---|---|---|
| `display` | 34px | 700 | Numeros grandes (104, 34) |
| `heading` | 20px | 700 | "Hello Peter", nombres |
| `label` | 11px | 600 (uppercase, +0.06em) | Etiquetas de seccion (NEW CASES) |
| `body` | 14px | 400 | Texto general, filas |
| `meta` | 12px | 400 | Fechas, timestamps |

**Notable**: etiquetas de seccion en MAYUSCULA con tracking positivo; numeros en bold marcado como ancla de jerarquia.

### 2.3 Spacing

- **Base**: 4px. **Multiplos**: 4, 8, 12, 16, 20, 24, 32, 40.
- Padding de tarjeta ~20-24px; gaps de grid ~16-20px. Consistencia ✅ high.

### 2.4 Radii

- `sm`: 10px (chips, sparkline holders) · `md`: 14px (search, inputs, item activo) · `lg`: 22px (tarjetas) · `pill`: 9999px (prioridades, avatares, botones +).

### 2.5 Elevation system

Sistema de **2 niveles**, deliberadamente ligero (sin sombras duras):

| Level | Name | Treatment | Use |
|---|---|---|---|
| 0 | Flat | sin sombra; sobre el lienzo | Fondo, divisores |
| 1 | Soft | `shadow-soft` (0 10px 30px rgba(180,120,70,0.10)) + vidrio | Tarjetas, paneles |
| 2 | Lift | `shadow-lift` | Hover de tarjeta / menus |

La clave: las sombras son **calidas** (tinte marron-durazno), no grises. Eso vende el "vidrio sobre luz".

#### Decorative depth

- **Atmospheric gradient**: el degradado calido del lienzo (signature) — nunca se miniaturiza.

### 2.6 Borders

- Casi sin borde: las tarjetas se separan por sombra + translucidez. Cuando hay borde, es hairline calido `{colors.border}` (#ECE1D4) a 1px. Divisores de tabla = 1px inferior tenue.

### 2.7 Accessibility quick-check

- `text-primary` (#211C17) sobre `surface` (#FCF6EE): ~13.5:1 — AAA ✅
- `accent` (#F2890F) sobre `surface` (#FCF6EE): ~2.6:1 — ❌ NO apto para texto pequeno; usar el acento solo como **fondo de boton con texto blanco** o como icono/borde, no como texto sobre claro. *(ver Do's/Don'ts)*
- `text-muted` (#9C9089) sobre `surface`: ~2.6:1 — limite; reservar para metadatos no criticos.

---

## 3. Components Inventory

### 3.1 Generic components

#### `{components.card}` — Card
- **Variants**: contenedor base translucido (tarjeta, panel del riel derecho).
- **Treatment**: `{colors.surface-translucent}` + `{rounded.lg}` (22px) + `shadow-soft`, borde hairline opcional.
- **States**: default; hover sube a `shadow-lift`.
- **Confidence**: ✅ high

#### `{components.stat-card}` — Stat card (con sparkline)
- **What**: etiqueta en `{typography.label}`, numero grande en `{typography.display}`, sparkline a la derecha y delta % coloreado (`{colors.success}`/`{colors.danger}`).
- **Confidence**: ✅ high

#### `{components.sidebar-item}` — Nav item
- **Variants**: default (texto + icono), activo (pill translucido `{colors.surface-2}` + acento), con badge (pill rojo de conteo, p.ej. Tasks "5").
- **Radius**: `{rounded.md}`.
- **Confidence**: ✅ high

#### `{components.search-bar}` — Search
- **What**: barra ancha translucida con lupa, placeholder muted, `{rounded.md}`.
- **Confidence**: ✅ high

#### `{components.pill-priority}` — Priority pill
- **Variants**: Low (borde/texto `{colors.success}`), Medium (ambar #E0A22E). Outline, fondo transparente, `{rounded.pill}`.
- **Confidence**: ✅ high

#### `{components.add-button}` — Add (+) button
- **What**: circulo solido `{colors.accent}` con "+" blanco, `{rounded.pill}`. Aparece en cada panel del riel derecho.
- **Confidence**: ✅ high

#### `{components.table-row}` — Table row
- **What**: fila con checkbox, Name (bold), Dates (meta), Priority pill, Attachment chip, Assignee (avatares apilados / boton +). Divisor inferior 1px `{colors.border}`.
- **Confidence**: ✅ high

### 3.2 Signature components

#### Stat card con sparkline calido
- **What it is**: tarjeta translucida con numero gigante + mini-grafico de linea (verde/rojo) integrado.
- **Why signature**: combina dato duro + tendencia en un gesto suave; el sparkline coloreado es el unico lugar donde entra el semaforo.
- **Composition**: `{components.stat-card}` + path SVG `{colors.success}`/`{colors.danger}` + delta.
- **Where**: fila superior del dashboard.
- **Confidence**: ✅ high

---

## 4. Layout & Composition

### 4.1 Grid & containers

- Shell de **3 columnas**: sidebar izq (~230px) · contenido central flexible (grid de tarjetas) · riel derecho (~300px: calendario, tareas, asignados).
- Padding generoso; gutters ~16-20px.

### 4.2 Composition patterns

- Topbar (search + usuario) full-width.
- Fila de 3 stat-cards; debajo, tabla ancha; debajo, grid de 2 (bar chart + country table).
- Riel derecho apilado en tarjetas independientes.

### 4.3 Responsive behavior

Solo desktop capturado — breakpoints inferidos (❓ low):

| Name | Width | Key changes |
|---|---|---|
| Mobile | < 760px | Sidebar -> drawer; riel derecho baja al final; stat-cards 1-up |
| Tablet | 760-1100px | Riel derecho colapsa o pasa abajo; stat-cards 2/3-up |
| Desktop | ≥ 1100px | 3 columnas completas |

#### Touch targets
- Botones + y avatares ~32-40px; subir a ≥44px en mobile.

#### Collapsing strategy
- Nav -> drawer; grids 3-up -> 1-up; tablas con scroll horizontal.

### 4.4 Image behavior

- **Avatares**: circulares, foto o inicial sobre color (`{colors.accent}` PF, `{colors.purple}` LA).
- **Sparklines / bar chart**: SVG inline, color de feedback.
- **Iconos**: line-icons finos (stroke ~1.6), estilo Lucide/Feather.

---

## 5. Reconstruction Notes (adaptado a NOCTURA)

### Suggested stack
**Vanilla CSS con variables** (el portal de NOCTURA ya usa CSS custom properties + `--accent`).

### Como mapear a NOCTURA (manteniendo `--accent`)
- Hoy el portal es glass **oscuro**. Para este look se invierte a **claro calido**:
  - `--black` (lienzo) -> degradado calido `{colors.canvas-from}`→`{colors.canvas-to}`, tenible por `--accent`.
  - texto `--bone/--ivory` (claro) -> `{colors.text-primary}` (#211C17) / `{colors.text-muted}`.
  - `--glass-bg` oscuro -> `{colors.surface-translucent}` (vidrio claro calido).
  - bordes `--glass-bd` blancos -> `{colors.border}` calido.
  - sombras -> calidas `shadow-soft` (no grises).
- **`--accent` se conserva**: por defecto naranja `{colors.accent}` (#F2890F), pero sigue siendo personalizable; tine botones +, item activo, dots, y un bloom calido del fondo.
- **Regla de contraste**: con tema claro, el acento NO se usa como texto sobre claro (ratio bajo) — solo como fondo de boton (texto blanco), icono o borde.

### Quick wins
- Paleta + tipografia + radios cubren ~80% del look.
- El fondo calido + el vidrio translucido + la sombra calida son el 90% del "efecto".

### Tricky bits
- Mantener legibilidad: texto oscuro sobre vidrio claro necesita opacidad de superficie suficiente (≥0.6) para no "lavarse" sobre el degradado.
- Que `--accent` claro/oscuro no rompa el contraste (forzar texto blanco sobre acento).

### Implicit states to define
- hover/active de tarjetas y nav, focus de inputs, estados vacios, badges de conteo.

### Confidence map

| Layer | Confidence | Why |
|---|---|---|
| Identity | ✅ high | Material claro |
| Colors | ⚠️ medium | Hex por vision, sin CSS |
| Typography | ⚠️ medium | Familia inferida |
| Spacing | ✅ high | Patron consistente |
| Components | ✅ high | Catalogo amplio visible |
| Layout | ⚠️ medium | Solo desktop |

---

## 6. Do's and Don'ts

### Do
- **Reserva `{colors.accent}` (#F2890F) para accion**: botones +, item activo, dots, iconos. Personalizable via `--accent`.
- **Pon texto BLANCO sobre el acento**; nunca acento como texto sobre superficie clara (contraste ~2.6:1).
- **Usa sombras calidas** `shadow-soft` (tinte durazno), nunca grises ni duras.
- **Tarjetas casi sin borde**: separa por translucidez + sombra; si hay borde, hairline `{colors.border}`.
- **Numeros grandes en `{typography.display}` (700)** como ancla de jerarquia; etiquetas en `{typography.label}` MAYUSCULA.
- **Verde/rojo solo para feedback** (tendencias, flechas, urgencias), nunca decorativo.
- **Radios grandes `{rounded.lg}` (22px) en tarjetas**, `{rounded.pill}` en chips/avatares/botones +.

### Don't
- **No uses blanco puro (#FFF) ni grises frios** — todo es blanco-roto calido; mata el calor.
- **No metas un 4.o color de marca**: texto + neutro calido + un acento + verde/rojo de feedback.
- **No pongas bordes duros ni sombras pesadas** — rompe el efecto vidrio.
- **No bajes la opacidad de la superficie por debajo de ~0.55** sobre el degradado (se lava el texto).
- **No uses el degradado calido en miniatura** (iconos, chips) — es lienzo, no decoracion puntual.
- **No mezcles radios chicos (≤8px) con el pill en la misma tarjeta** — elige escala.

---

## 7. Open Questions

- ¿Familia tipografica exacta? Inter vs Plus Jakarta Sans (sin CSS no se confirma).
- ¿Hex exactos del degradado y superficies? Inferidos por vision (⚠️). Si tuvieras el archivo de diseno, se afinan.
- ¿Hay modo oscuro o solo claro? Solo claro observado.
- ¿Breakpoints reales? Solo desktop capturado.
- Para NOCTURA: ¿reemplazo total del tema oscuro por este claro, o **toggle claro/oscuro**? (decision de marca — NOCTURA = identidad "nocturna").

---

## 8. Companion files

- [x] `design-tokens.json` — tokens DTCG (`$value`/`$type`).
- [ ] `design-a11y.md` — no generado (resumen de contraste incluido en 2.7).
- [ ] `design-screenshot.png` — la fuente es la captura del usuario.

---

*Fin del analisis. Siguiente paso sugerido: aplicar este sistema al portal de NOCTURA como tema claro (con preview antes de desplegar) manteniendo `--accent`.*
