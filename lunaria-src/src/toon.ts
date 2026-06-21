import * as THREE from 'three'

/**
 * Gradient map compartido para todo el cel shading de la escena.
 * Singleton: una sola textura 1D de 3 pasos reutilizada por luna, rover y rocas.
 */
let grad: THREE.DataTexture | null = null

export function toonGradient(steps = 3): THREE.DataTexture {
  if (grad) return grad
  const data = new Uint8Array(steps)
  for (let i = 0; i < steps; i++) {
    data[i] = Math.round((i / (steps - 1)) * 255)
  }
  const t = new THREE.DataTexture(data, steps, 1, THREE.RedFormat)
  t.minFilter = THREE.NearestFilter
  t.magFilter = THREE.NearestFilter
  t.needsUpdate = true
  grad = t
  return t
}

export const MOON_RADIUS = 14.4 // luna 3× más grande (antes 4.8); el relieve escala su densidad con el radio
