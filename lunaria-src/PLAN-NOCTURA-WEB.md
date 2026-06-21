# PLAN — LUNARIA → Página de Servicios de NOCTURA

> Generado con análisis multi-agente (4 conceptos creativos + panel de evaluación multi-lente + síntesis).
> Fuente: demo 3D LUNARIA (`/Users/nelson/Claude/DEMO GAME/`) → noctura-studio.com/servicios

## Ranking de conceptos evaluados

| Concepto | Promedio |
|---|---|
| ECLIPSE — De la oscuridad a la luz | **7.0** |
| El Hemisferio Nocturno (D) | **7.0** |
| CONSTELACIÓN — Sistema Lunar de Servicios | 6.2 |
| ORBITAL — Estación de Servicios | 5.6 |

---

## 1. Concepto elegido

**FUSIÓN — "NOCTURA · El Hemisferio"**: arquitectura HTML-first del *Hemisferio Nocturno* (D) + alma cinematográfica de *ECLIPSE* (terminador lunar "de la oscuridad a la luz", proceso de 4 fases lunares = iluminación de la luna) + un solo gesto del *viaje-rayo* (transición premium a Portafolio).

- CONSTELACIÓN y ORBITAL pierden por enterrar la conversión detrás del juego (UX 4 y 5).
- D gana el desempate por UX-conversión (7 vs 6): contenido en HTML semántico real, 3D como capa decorativa sticky → convierte y posiciona aunque el WebGL se caiga.
- ECLIPSE aporta el momento de marca estrella (terminador) que sube la marca de 7 a 8+.

**Narrativa:** se llega a una luna en eclipse total (oscuridad, marca aún invisible). Al bajar, el sol barre el terminador sobre la superficie cel-shaded y cada servicio se enciende como un monolito. El proceso (4 fases lunares) ES la iluminación de la luna. Cierra en alba crema → CTA "Hablemos de tu marca".

---

## 2. Recorrido (scroll nativo, nunca bloqueado; ~700–800vh)

Nav ancla sticky desde el inicio: `Esencia · Servicios · Proceso · Trabajo · Planes · Contacto` + CTA flotante / WhatsApp (saltar al contacto en 1 clic).

- **Escena 0 — Umbral / Eclipse total (hero):** negro `#05060d`, Galaxy, luna insinuada por un anillo de luz. Logo N🌙CTURA (la luna 3D es la "O"). "Creamos marcas inevitables". La carga del 3D ocurre dentro del eclipse.
- **Escena 1 — Esencia (0–15%):** el sol asoma, el terminador avanza (primer gajo de luz). Microinteracción "decodificar": silueta ruidosa → forma nítida.
- **Escena 2 — Servicios (15–55%):** la luna gira trayendo cada uno de los 5 monolitos al frente; se encienden. Tarjeta HTML del servicio activo = fuente de verdad.
- **Escena 3 — Proceso "4 fases lunares" (55–70%):** la luna cicla nueva→creciente→llena→menguante por scroll. 4 tarjetas HTML.
- **Escena 4 — Trabajo (70–82%):** viaje-rayo único (saltable, solo desktop+GPU) luna→Tierra re-pintada. Grid HTML de 6 casos.
- **Escena 5 — Planes + Contacto / Alba (82–100%):** paleta vira a crema. Tabla de 3 planes, formulario + WhatsApp.

---

## 3. Mapeo contenido NOCTURA → 3D

| Contenido | Representación 3D | Texto |
|---|---|---|
| 01 Estrategia e Identidad | Monolito central, el más alto y luminoso | cuestionario, posicionamiento, logo, Logo Pack, Mini Brandbook, carta sensorial |
| 02 Presencia Digital | Monolito con anillo de micro-luces orbitando | perfil, 4-12 publicaciones/mes, reuniones quincenales |
| 03 Diseño Gráfico | Monolito con caras-rótulo emisivas | menús, rótulos, material, fachadas, señalética |
| 04 Asesoría Espacial | Monolito con relieve arquitectónico | moodboard, ambientación, distribución, fachadas |
| 05 Mentoría y Consultoría | Monolito-observatorio, god-ray suave | mentoría, emprendimiento, tributaria, inscripción |
| Rituales Individuales | Tarjeta HTML "a la carta" (fuera del hero) | servicios sueltos, precio según evaluación |
| Proceso 4 fases | LA luna ciclando fases (Escena 3) | 4 tarjetas |
| 3 Planes | Alba; opcional 3 lunas-menores | tabla: $139/$199/$299 +IVA, 50% depósito, 5-10 días |
| Portafolio (6) | Grid sobre la Tierra de fondo | NOVA, ARQSA, Genesis, GARBAL, INNOVA GC, EG + testimonios |
| Contacto | Escena de alba | somos@noctura-studio.com · +503 7244 0647 · @somosnoctura |

**Clave de marca:** los monolitos NO son `Shop.tsx` (machiya + farol rojo, off-brand). Se rediseñan como **obeliscos cel-shaded grafito/crema** con una sola luz crema fría — se conserva solo el patrón técnico (mesh + emissive + Billboard `<Text>` + Outlines). Tipografía 3D: **Cormorant Garamond** (vía troika SDF).

---

## 4. Arquitectura técnica

| Componente | Veredicto | Esfuerzo |
|---|---|---|
| `Galaxy.tsx` | Reusar tal cual | Bajo |
| `Sun.tsx` + `SunLight.tsx` | Adaptar (animar luz por `t`) | Medio |
| `Moon.tsx` + `moonGeometry.ts` | Adaptar — uniform `phase` + shader terminador (`onBeforeCompile`), bajar a detail 64 | Alto |
| `Planet.tsx` + `planetGeometry.ts` | Re-pintar a paleta nocturna | Medio |
| `Rayo.tsx` + `travel.ts` | Desacoplar de Rapier → `WarpDriver` sin física | Alto |
| `FollowCamera.tsx` | Reescribir → `ScrollCamera` (spline keyframes) | Alto |
| `Shop.tsx`/`Village.tsx` | Reusar patrón, NO forma (obelisco crema) | Medio |
| `toon.ts` | Reusar (subir gradiente a 4-5 pasos) | Bajo |
| Postproceso (EffectComposer) | Reusar + gatear por dispositivo | Medio |
| `Rover`, `roverRef`, `SphericalGravity`, `MoonCollider`, `Dust`, Rapier, Dpad, slider | **Eliminar** (sin personaje, sin física → −1.4MB WASM) | — |

**Estimación honesta: ~40% reuso / 60% construcción nueva.**

**Integración (sin romper /clientes):** ruta nueva `/servicios`, aislada (sin estado ni provider Three/Rapier compartido con el portal). **Abandonar `vite-plugin-singlefile`** (3.6MB inline render-blocking) → code-splitting + Canvas en chunk dinámico (`React.lazy`+`Suspense`) tras el LCP.

**SEO/contenido:** HTML-first como cimiento (no fallback). Prerender/SSG (Astro islands / vite-plugin-ssr / react-snap). JSON-LD (Organization + 5× Service + 3× Offer + ContactPoint). Quitar `maximum-scale=1.0,user-scalable=no` (WCAG 1.4.4). `services.ts`/CMS = fuente única que alimenta HTML y 3D.

**Fallback 2D:** sin WebGL2 / reduced-motion / gama baja → poster AVIF/WebP (<150KB) + mismas secciones HTML. Página 100% funcional sin una línea de WebGL.

---

## 5. Interacción y animación

- Conductor: un único `t` global + `t` por sección (lenis opcional, jamás bloqueado).
- `ScrollCamera`: spline CatmullRom de keyframes (pos + lookAt) con damping.
- Cámara y ángulo del sol como UNA función de `t` (no se desincronizan).
- Encendido de monolitos por IntersectionObserver (no raycast por frame).
- Viaje-rayo único, saltable; estela crema-plateada (no el azul actual).
- Microinteracciones: "decodificar", mini-luna de progreso, barrido de luz en móvil.

---

## 6. Sistema visual

- **Paleta:** negro `#05060d` / grafito; luz crema `#fff3df`; acento plata-luna `#c6cad8` + oro apagado `#B8B0A4` solo en activo/hover. **Prohibido:** dorado saturado `#ffb454`, rojo farol, océano azul + lava naranja. El sol cálido del cierre es la única excepción.
- **Tipografía:** Cormorant Garamond (wordmark, billboards, titulares) + Inter (cuerpo).
- **Cel-shading dominante**; la Tierra (único PBR) se re-pinta o pasa a toon.
- **Postproceso:** desktop full; móvil = Bloom + Vignette + Noise (GodRays/LensFlare OFF, N8AO half/off, Galaxy 16.9k→5-6k partículas).
- **Logo:** la luna 3D ES la "O" de N🌙CTURA; el terminador la atraviesa al iluminarse.

---

## 7. Rendimiento y accesibilidad

- Luna detail 64 (~80k tris), monolitos <2k, objetivo <100 draw calls. DPR `[1,1.5]`.
- `quality.ts` (net-new): detecta capacidades + FPS-probe → degrada escalonado (GodRays/LensFlare → N8AO → Galaxy → DPR).
- Canvas lazy tras LCP; `frameloop` pausado fuera de viewport/foco.
- `prefers-reduced-motion` base; teclado; Canvas `aria-hidden` + DOM semántico paralelo; contraste AA; fix pinch-zoom.
- QA: LCP < 2.5s en 4G (HTML como LCP, no el Canvas); ≥30fps en Android gama-media.

---

## 8. Roadmap

- **Fase 1 — MVP (1.0×):** `/servicios` HTML-first completo (services.ts, 5 servicios, planes, proceso, portafolio, testimonios, form, prerender, JSON-LD) + Canvas sticky de hero (luna+Galaxy+Sun+postproceso) + nav ancla + fallback 2D. *Ya vende sin 3D avanzado.*
- **Fase 2 — Completo (1.5×):** spike del shader de fases lunares PRIMERO (atenuar luz de relleno de App.tsx 55-57) → `ScrollCamera` → terminador + 5 monolitos + proceso = fases → sincronía 3D↔DOM.
- **Fase 3 — Pulido (0.7×):** `WarpDriver` sin Rapier + viaje-rayo a la Tierra, microinteracción "decodificar", clímax luna llena, alba crema, tiering fino + QA real + Lighthouse.

---

## 9. Riesgos principales

- **Shader de fases vs. App.tsx que ilumina a propósito para NO tener lado oscuro (líneas 52-57)** → spike aislado en Fase 2 antes de comprometer.
- Esfuerzo subestimado (cámara/warp atados a roverRef/Rapier) → reclasificado net-new ~60%.
- Bundle single-file render-blocking → code-split + lazy.
- React CSR no indexa → prerender/SSG obligatorio.
- Cinetosis → scroll nativo + damping + reduced-motion + "saltar".

---

## 10. Decisiones abiertas para Nel

1. ¿`/servicios` en el React actual con prerender, o como app **Astro** independiente?
2. ¿Contenido en `services.ts` hardcoded, Markdown, o CMS/Supabase (editar precios sin rebuild)?
3. ¿Luna cel-shaded plateada, o explorar el avatar de marca (peli-plateado, máscara dorada, capa N)?
4. ¿Tienes assets reales del portafolio (logos/imágenes de los 6 proyectos)?
5. ¿Formulario a dónde envía? (Resend/FormSubmit a somos@ o lead en Supabase)
6. ¿Reemplaza la `/servicios` actual y/o conserva LUNARIA jugable en `/demo`?

---

## Por dónde empezar esta semana

1. **Esqueleto HTML-first de `/servicios`** (greenfield, 70% del valor de negocio, no depende de desenredar LUNARIA).
2. **Spike del shader de fases lunares** (1 día): clonar `Moon.tsx`, atenuar luz de relleno de `App.tsx`, uniform `phase` + `onBeforeCompile` → ver si el terminador se ve premium con el toon. *Decide si la fusión es viable.*

**Archivos clave:** `App.tsx` (52-57 luz a desmontar; 102-131 postproceso), `Moon.tsx` (base shader), `FollowCamera.tsx` (→ ScrollCamera), `Rover.tsx` (78-111 warp → WarpDriver), `Shop.tsx` (patrón a rescatar).
