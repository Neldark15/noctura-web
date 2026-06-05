# DESIGN.md — NOCTURA Studio & Consulting

> Oscuridad sofisticada que respira: cada interacción debe sentirse como la luna revelándose entre nubes.

## 1. Visual Theme & Atmosphere

**Style**: Dark Editorial — Lunar Cold Silver
**Keywords**: nocturno, lunar, sofisticado, frío, profundo, preciso, inevitable
**Tone**: Silencio poderoso que impone respeto — NOT ruidoso, NOT saturado, NOT genérico
**Feel**: Como observar una luna llena en una noche completamente clara — silencio que impacta.

**Interaction Tier**: L2+ (Fluida con momentos inmersivos)
**Dependencies**: GSAP + ScrollTrigger (ya integrado)

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds — ya definidos en variables.css */
  --color-black:        #08080A;
  --color-graphite:     #141418;
  --color-anthracite:   #222228;
  --color-charcoal:     #38383F;

  /* Text */
  --color-bone:         #D8D4CE;
  --color-ivory:        #EDEAE5;
  --color-muted:        #7E7F86;

  /* Accents (Lunar Cold Palette) */
  --color-silver:       #B0B3BC;
  --color-gold:         #B8B0A4;

  /* Glass */
  --color-overlay:      rgba(8, 8, 10, 0.88);
  --color-glass:        rgba(20, 20, 24, 0.65);

  /* RGB variants para rgba() */
  --color-ivory-rgb:    237, 234, 229;
  --color-silver-rgb:   176, 179, 188;
  --color-gold-rgb:     184, 176, 164;
}
```

**Color Rules:**
- Todos los colores vía CSS variables, cero hex hardcoded
- Gold (#B8B0A4) solo para acentos sutiles, nunca dominante
- Gradientes permitidos solo en glow/shine, nunca en fondos sólidos

## 3. Typography Rules

```css
/* Ya definidos — mantener tal cual */
--font-display:  'Cormorant Garamond', Georgia, serif;
--font-body:     'Inter', 'Helvetica Neue', sans-serif;
--font-accent:   'Libre Baskerville', Georgia, serif;
```

**Google Fonts URL**: `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&family=Libre+Baskerville:ital@0;1&display=swap`

**Escala tipográfica**: Ya definida con clamp() — mantener.

**Prohibido**: Nunca usar sans-serif en títulos principales. Nunca mezclar más de 3 familias.

## 4. Component Stylings — Mejoras Propuestas

### 4a. Botón CTA con efecto Magnet
El botón "ENVIAR MENSAJE" y cualquier CTA primario deben tener efecto magnético (se acerca al cursor) + glow sutil en hover.

```css
.btn-cta {
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.4s var(--ease-out), transform 0.2s var(--ease-out);
}
.btn-cta:hover {
  box-shadow: 0 0 30px rgba(var(--color-silver-rgb), 0.15),
              0 0 60px rgba(var(--color-silver-rgb), 0.05);
}
.btn-cta:active {
  transform: scale(0.97);
}
.btn-cta:focus-visible {
  outline: 1px solid var(--color-silver);
  outline-offset: 4px;
}
```

### 4b. SpotlightCard para tarjetas de servicio (Foundation Grid)
Las tarjetas de la sección de servicios/planes deben tener efecto spotlight — un gradiente radial que sigue el cursor.

### 4c. Marquee horizontal para "MARCAS QUE CONFÍAN"
Reemplazar la lista estática de marcas por un marquee infinito con CSS puro.

### 4d. ShinyText para frases clave
Efecto de brillo metálico que recorre el texto del tagline y el manifesto.

## 5. Layout Principles

- Container: 1200px máximo, 2rem padding
- Grid: CSS Grid para portfolio (2 cols) y planes (3 cols → 1 col mobile)
- Spacing scale: 0.5 / 1 / 2 / 4 / 8 / 12 rem
- Sin cambios necesarios — el layout actual es sólido

## 6. Depth & Elevation

Sistema neo-skeuomorphic ya definido con 3 niveles de sombra + glow lunar. Mantener tal cual.

**Mejora**: Agregar glow dinámico a las tarjetas del portfolio en hover (ya existe el tilt 3D, agregar glow lunar).

## 7. Animation & Interaction — Signature Moments

### Obligatorios (L2+ Dark Editorial):

| # | Tipo | Momento | Estado |
|---|------|---------|--------|
| 1 | Background — Atmósfera | Silk/Aurora sutil en el hero | ❌ AGREGAR |
| 2 | Text Animation — Hero H1 | ShinyText en tagline "Estrategia · Identidad · Percepción" | ❌ AGREGAR |
| 3 | Text Animation — H2 | ScrollFloat en section headings | ✅ Ya existe (SplitText) |
| 4 | Text Animation — Body | ScrollReveal word-by-word en manifesto | ✅ Ya existe |
| 5 | Animation — Elemento | Magnet en CTA + SpotlightCard en tarjetas | ❌ AGREGAR |
| 6 | Component — Interactivo | Marquee infinito en "Marcas que confían" | ❌ AGREGAR |

### Animaciones a implementar:

**A. ShinyText en el tagline del hero**
Un brillo metálico plateado que recorre periódicamente el texto "Estrategia · Identidad · Percepción"

**B. Marquee infinito para clientes**
CSS transform puro, sin JS — performance friendly.

**C. SpotlightCard en las tarjetas del foundation grid**
Gradiente radial que sigue `--mx/--my` del cursor.

**D. Magnet en botón CTA**
El botón se desplaza sutilmente hacia el cursor al acercarse.

### Reduced Motion:
```css
@media (prefers-reduced-motion: reduce) {
  .shiny-text { background-size: 100% !important; animation: none !important; }
  .marquee__track { animation: none !important; }
  .spotlight-card::before { display: none; }
}
```

## 8. Do's and Don'ts

### Do's
1. ✅ Usar transiciones con cubic-bezier(0.16, 1, 0.3, 1) — ease-out elegante
2. ✅ Mantener la metáfora lunar en todo — fases, glow, plata
3. ✅ Respetar prefers-reduced-motion siempre

### Don'ts
1. ❌ Nunca usar colores saturados (rojo, azul eléctrico, verde neón)
2. ❌ Nunca animar más de 3 propiedades simultáneamente por elemento
3. ❌ Nunca usar filter: blur() en elementos en movimiento
4. ❌ Nunca usar más de 1 WebGL scene por página
5. ❌ Nunca romper el scroll nativo excepto para pin-scrub justificado
6. ❌ Nunca usar emojis ni iconos playful — mantener la seriedad
7. ❌ Nunca usar bordes redondeados mayores a 8px — el diseño es angular
8. ❌ Nunca usar sombras coloreadas — solo negras/transparentes

## 9. Responsive Behavior

**Breakpoints** (desktop-first):
- ≤1400px: Orbital rings reducidos
- ≤1200px: Container padding reducido, outer ring hidden
- ≤900px: Hamburger menu, orbital hidden, cursor hidden, panels → scroll
- ≤600px: Single column, simplified typography

**Touch targets**: Mínimo 44×44px en móvil
**Hover effects**: Solo activar con `@media (hover: hover)`
