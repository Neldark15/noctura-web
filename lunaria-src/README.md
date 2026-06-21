# 🌙 LUNARIA — demo de juego web (Three.js + cel shading)

Demo de un mini-juego que corre **100% en el navegador, sin instalar nada, fluido en móvil**.
Una luna planeta-juguete con estética _cel shading_ (cómic/anime) que recorres con un rover
para encender balizas. Inspirado en el trabajo de [abeto.co](https://abeto.co) y en el
portfolio-juego de [Bruno Simon](https://bruno-simon.com).

## Stack

| Capa            | Paquete                       |
| --------------- | ----------------------------- |
| Render 3D       | `three` (WebGL2)              |
| React + 3D      | `@react-three/fiber` (R3F)    |
| Helpers         | `@react-three/drei`           |
| Post-proceso    | `@react-three/postprocessing` |
| Build / dev     | `vite`                        |
| Lenguaje        | TypeScript                    |

> WebGPU se deja para una v2. Arrancamos en WebGL2 por cobertura casi universal.

## Cómo correrlo

```bash
npm install        # solo la primera vez
npm run dev        # arranca en http://localhost:5180
npm run dev -- --host   # + accesible desde el celular en la red local
```

Para probar en el celular: corre con `--host`, abre la IP local que imprime Vite
(ej. `http://192.168.x.x:5180`) en el navegador del teléfono.

## El cel shading (cómo funciona)

No se hornea en el modelo, se aplica en runtime:

1. **`MeshToonMaterial` + `gradientMap`** — la textura 1D de pocos pasos "corta" la luz
   en bandas duras en vez de un degradado suave. Ver `src/Moon.tsx` → `useToonGradient`.
2. **`<Outlines>` de drei** — dibuja el contorno negro (casco invertido). La otra mitad del look.
3. **Luz clave cálida + relleno frío** — da el contraste que las bandas necesitan.
4. **Post: Bloom + Noise + Vignette** — el "grano" y brillo que firman el estilo abeto.co.

## Pipeline de modelos (Blender → Three.js)

Los modelos detallados se hacen en **Blender** (gratis). El flujo:

```bash
# 1. Modelar en Blender → exportar como GLB (File ▸ Export ▸ glTF 2.0 .glb)
# 2. Comprimir + convertir a componente React:
npx gltfjsx public/models/rover.glb --transform
#    genera Rover.jsx ya optimizado (Draco + KTX2 + resize), -70/90% de peso
# 3. Aplicarle el material toon + outlines en el componente (igual que Moon.tsx)
```

> En Blender solo modelas la **forma**; el look cel lo pone Three.js. Menos trabajo.
> Instalar Blender: `brew install --cask blender` o desde blender.org.

## Estado / Roadmap

- [x] Scaffold Vite + R3F + drei + postprocessing
- [x] Luna procedural cel-shaded (cráteres, outline, bloom, estrellas) — _provisional_
- [x] DPR clampeado y `touch-action` para móvil
- [x] **Física con Rapier** (`@react-three/rapier`)
- [x] **Gravedad esférica** custom: todo cae hacia el centro de la luna (`SphericalGravity.tsx`)
- [x] Rover con física (esfera) que rueda pegado a la superficie — _provisional_
- [x] Escombros: rocas cel-shaded que caen y se asientan (`Debris.tsx`)
- [x] Controles teclado (WASD/flechas) + D-pad táctil (`input.ts`, `Dpad` en `App.tsx`)
- [x] **Control de gravedad en vivo** (slider UI → `settings.ts`, leído por `SphericalGravity`)
- [x] **Tuning del rover**: impulso escalado por masa + tope de velocidad + damping (ya no sale volando)
- [x] **Luna más detallada**: malla detalle 64 (~80k tris), ~60 cráteres variados + micro-relieve
- [x] **Build a un solo `dist/index.html`** autocontenido (`vite-plugin-singlefile`)
- [x] **Cámara que sigue al rover** (3ª persona, `FollowCamera.tsx`) + toggle seguir/libre
- [x] Asteroides en dos tamaños (normales + mini) vía props de `Debris`
- [x] **Luna detalle 96** (~184k tris) + zoom de cámara más cercano (`minDistance` 1.9)
- [x] **Mini pueblo japonés** sobre la luna (`Village.tsx` + `Shop.tsx`): tiendas machiya
      cel-shaded (cuerpo + techo piramidal + farol rojo) con nombre flotante (`<Text>` billboard)
- [x] **Cielo estrellado intenso + Vía Láctea** como partículas (`Galaxy.tsx`: estrellas de
      fondo + banda densa + nebulosa, shader de puntos con blending aditivo, sin niebla)
- [x] **Oclusión ambiental** N8AO en el post-proceso (profundidad en cráteres y tiendas)
- [x] **Polvo lunar** que levanta el rover al moverse (`Dust.tsx`: pool de partículas con shader)
- [x] **Cráteres físicos**: collider de malla (`MoonCollider.tsx`, `TrimeshCollider`) con la misma
      forma que la visual (vía `moonGeometry.ts`, detalle 44) → el rover se mete en los cráteres
      y brinca en los bordes en vez de flotar. Rover con `ccd` para no atravesar el relieve.
- [x] Pueblo japonés quitado de la escena (archivos `Village.tsx`/`Shop.tsx` conservados)
- [ ] Modelo `.glb` del rover (todo junto; ruedas separadas solo si deben girar)
- [ ] Loop de juego (objetivos, timer, victoria)
- [ ] Reemplazar la luna procedural por modelo de Blender (cráteres detallados)
- [ ] Rover lunar (modelo Blender) con material toon, encima del cuerpo físico
- [ ] Loop de juego: encender 3 balizas en 60-90s + timer + estado win
- [ ] Audio (Howler) + pulido + empaquetar como PWA

### Notas de implementación de la física

- `<Physics gravity={[0,0,0]}>` — la gravedad global se anula; la esférica se aplica a mano.
- `SphericalGravity.tsx` usa `useBeforePhysicsStep` + `world.forEachRigidBody` para empujar
  cada cuerpo dinámico hacia el centro (`F = m·g·dirección`).
- **Importante:** `<Physics>` debe ir en su **propio `<Suspense>`** (carga su WASM de forma
  asíncrona y suspende). Si comparte Suspense con el resto, oculta toda la escena al arrancar.
- `resolve.dedupe: ['three']` en `vite.config.ts` evita el bug de doble copia de Three.js
  (lo arrastra `stats-gl` vía drei) que rompe el reconocimiento de objetos en Rapier.

## Notas de rendimiento (móvil)

- `dpr={[1, 1.5]}` en el `<Canvas>` — lo más importante para fluidez.
- Objetivo: < 100 draw calls. Instanciar props repetidos con `<Instances>` de drei.
- Texturas en KTX2, geometría con Draco/Meshopt (vía `gltfjsx --transform`).
- Medir con `renderer.info.render.calls`.
