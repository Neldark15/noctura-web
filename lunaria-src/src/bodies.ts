import * as THREE from 'three'
import { MOON_RADIUS } from './toon'

/**
 * ÚNICA FUENTE DE VERDAD de los cuerpos celestes (luna, planeta, sol).
 * La leen: la gravedad multi-cuerpo, los colliders, los renderers (Planet/Sun),
 * la cámara, el personaje, el polvo y el tablero de viaje. Todo es relativo al
 * CENTRO del cuerpo dominante (la luna ya no es "el origen" implícito).
 */
export type BodyId = 'moon' | 'planet' | 'sun'

export interface CelestialBody {
  id: BodyId
  label: string // texto en español para la UI
  center: THREE.Vector3
  radius: number
  surfaceGravity: number // aceleración en la superficie (a slider=ANCHOR)
  surfaceOffset: number // cuánto se eleva el spawn/aterrizaje sobre el radio
  walkable: boolean
  travelable: boolean // aparece en el tablero de viaje y tiene collider de aterrizaje
}

// Escala "equilibrado": distante pero presente y alcanzable.
export const MOON: CelestialBody = {
  id: 'moon',
  label: 'Luna',
  center: new THREE.Vector3(0, 0, 0),
  radius: MOON_RADIUS, // 4.8
  surfaceGravity: 14, // ancla de calibración del slider
  surfaceOffset: 0.18,
  walkable: true,
  travelable: true,
}

// La Tierra: al lado OPUESTO del sol (≈ -dirección del sol · 300) para llegar a
// su cara iluminada y sin el resplandor del sol detrás. 5× más grande (radio 27).
export const PLANET: CelestialBody = {
  id: 'planet',
  label: 'Tierra',
  center: new THREE.Vector3(-171, -60, 239), // ~300u del origen, opuesto al sol
  radius: 27,
  surfaceGravity: 16,
  surfaceOffset: 0.18,
  walkable: true,
  travelable: true,
}

export const SUN: CelestialBody = {
  id: 'sun',
  label: 'Sol',
  center: new THREE.Vector3(200, 70, -280), // ~350u del origen
  radius: 26,
  surfaceGravity: 30,
  surfaceOffset: 0.3,
  walkable: false,
  travelable: false, // NO se puede viajar al sol (solo brilla e ilumina)
}

export const BODIES: CelestialBody[] = [MOON, PLANET, SUN]

/** Slider de gravedad calibrado a este valor (= MOON.surfaceGravity).
 *  gMul = settings.gravity / GRAVITY_ANCHOR → 1.0x en el default 14.
 *  Cambiar MOON.surfaceGravity reescalaría el significado del slider. */
export const GRAVITY_ANCHOR = 14

export function bodyById(id: BodyId): CelestialBody {
  return BODIES.find((b) => b.id === id) ?? MOON
}

/** Cuerpo dominante = el de MENOR distancia a su superficie (gap = |pos-c| - r).
 *  Decide a la vez qué gravedad jala y qué centro define el "arriba" local.
 *  Sin asignaciones en el hot-path. */
const _tmp = new THREE.Vector3()
export function dominantBody(pos: THREE.Vector3): CelestialBody {
  let best = BODIES[0]
  let bestGap = Infinity
  for (let i = 0; i < BODIES.length; i++) {
    const b = BODIES[i]
    const gap = _tmp.subVectors(pos, b.center).length() - b.radius
    if (gap < bestGap) {
      bestGap = gap
      best = b
    }
  }
  return best
}

/** "Arriba" local: dirección normalizada del centro del cuerpo hacia pos.
 *  Escribe en `out` y lo devuelve (zero-alloc). */
export function localUp(
  pos: THREE.Vector3,
  out: THREE.Vector3,
  body?: CelestialBody,
): THREE.Vector3 {
  const b = body ?? dominantBody(pos)
  out.subVectors(pos, b.center)
  const len = out.length() || 1
  out.multiplyScalar(1 / len)
  return out
}
