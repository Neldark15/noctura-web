import { useMemo } from 'react'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { buildMoonGeometry } from './moonGeometry'

/**
 * Malla visual de la luna (cel-shaded), a alta resolución. La forma la genera
 * `buildMoonGeometry`, la misma función que usa el collider de física, así
 * lo que ves coincide con lo que el rover toca. Con ALBEDO por vértice
 * (mares, suelos de cráter, bordes y rayos de eyección).
 */

// gradiente cel propio de la luna: 4 pasos → bandas suaves pero marcadas
function moonGradient() {
  const steps = 4
  const data = new Uint8Array(steps)
  for (let i = 0; i < steps; i++) data[i] = Math.round((i / (steps - 1)) * 255)
  const t = new THREE.DataTexture(data, steps, 1, THREE.RedFormat)
  t.minFilter = THREE.NearestFilter
  t.magFilter = THREE.NearestFilter
  t.needsUpdate = true
  return t
}

export default function Moon() {
  const gradient = useMemo(() => moonGradient(), [])
  const geometry = useMemo(() => buildMoonGeometry(144, true, true), []) // detalle alto (luna 3×), albedo por vértice

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshToonMaterial vertexColors color="#ffffff" gradientMap={gradient} />
      <Outlines thickness={1.5} color="#15172a" />
    </mesh>
  )
}
