import * as THREE from 'three'
import { bodyById, dominantBody, type BodyId, type CelestialBody } from './bodies'

/**
 * Máquina de estados del VIAJE entre cuerpos (singleton mutable, como input.ts).
 *  - walk: control normal, pegado al cuerpo dominante.
 *  - warp: el personaje despega convertido en "rayo" y cruza el espacio a gran
 *    velocidad hacia un punto sobre la superficie del destino; al llegar vuelve
 *    a walk y el pegado-al-suelo lo asienta.
 */
export type TravelMode = 'walk' | 'warp'

export const travel = {
  mode: 'walk' as TravelMode,
  from: 'moon' as BodyId, // cuerpo actual
  to: null as BodyId | null, // destino mientras viaja
  t: 0, // tiempo en warp (s)
  landing: new THREE.Vector3(), // punto objetivo (sobre la superficie del destino)
  dir: new THREE.Vector3(0, 0, 1), // dirección de vuelo (para cámara y rayo)
  speed: 0, // rapidez actual del rayo (para la estela)
  _hasLanding: false,
}

// Tunables del viaje (escala "equilibrado")
export const WARP_CRUISE = 90 // velocidad pico (u/s) — Tierra a ~300u → ~3-4s de viaje
export const WARP_RAMP = 1.5 // rampa de aceleración (1/s)
export const WARP_LIFT = 0.6 // altura del punto de aterrizaje sobre la superficie

/** Inicia un viaje al cuerpo `to` (solo si camina y no es el actual). */
export function startTravel(to: BodyId) {
  if (travel.mode !== 'walk' || to === travel.from) return
  travel.to = to
  travel.mode = 'warp'
  travel.t = 0
  travel._hasLanding = false
}

const _dir = new THREE.Vector3()
/** Fija el punto de aterrizaje en el lado del destino por el que llegamos. */
export function computeLanding(fromPos: THREE.Vector3) {
  const dest = bodyById(travel.to!)
  // OJO: usar un vector TEMP, no travel.landing (si no, al copiar dest.center
  // se sobreescribe la dirección y el destino sale disparado a centro×escalar).
  _dir.subVectors(fromPos, dest.center)
  if (_dir.lengthSq() < 1e-6) _dir.set(0, 1, 0)
  _dir.normalize()
  travel.landing.copy(dest.center).addScaledVector(_dir, dest.radius + dest.surfaceOffset + WARP_LIFT)
  travel._hasLanding = true
}

export function finishTravel() {
  travel.from = travel.to!
  travel.to = null
  travel.mode = 'walk'
}

export function isWarping() {
  return travel.mode === 'warp'
}

export function inTransit() {
  return travel.mode !== 'walk'
}

/** Cuerpo que define el "arriba" local: en tránsito el DESTINO; si no, el dominante. */
export function activeBody(pos: THREE.Vector3): CelestialBody {
  if (travel.mode !== 'walk' && travel.to) return bodyById(travel.to)
  return dominantBody(pos)
}
