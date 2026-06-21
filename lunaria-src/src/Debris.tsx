import { useEffect, useMemo, useRef } from 'react'
import { InstancedRigidBodies } from '@react-three/rapier'
import * as THREE from 'three'
import { toonGradient, MOON_RADIUS } from './toon'

/**
 * Escombros: rocas cel-shaded que caen desde el espacio y se asientan sobre el
 * cuerpo por la gravedad esférica. Usa InstancedRigidBodies → cientos de rocas
 * con física propia en UN solo draw call. Tamaños variados (ley de potencia:
 * muchas pequeñas, algunas enormes) y color por instancia.
 */

// Geometría de roca compartida: icosaedro low-poly deformado (facetado).
function useRockGeometry() {
  return useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 1)
    const pos = g.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const n = 0.74 + 0.36 * Math.abs(Math.sin(v.x * 5.1 + v.y * 3.3 + v.z * 4.7))
      v.multiplyScalar(n)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
    return g
  }, [])
}

// PRNG determinista (sin Math.random → las rocas caen siempre igual).
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function Debris({
  count = 120,
  minScale = 0.02,
  maxScale = 0.12,
  seed = 1337,
  center = [0, 0, 0],
  radius = MOON_RADIUS,
  tint = '#9aa0b4',
}: {
  count?: number
  minScale?: number
  maxScale?: number
  seed?: number
  center?: [number, number, number]
  radius?: number
  tint?: string
}) {
  const geom = useRockGeometry()
  const gradient = useMemo(() => toonGradient(), [])
  const mat = useMemo(() => new THREE.MeshToonMaterial({ gradientMap: gradient }), [gradient])
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const { instances, colors } = useMemo(() => {
    const rnd = mulberry32(seed)
    const inst: { key: number; position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] }[] = []
    const cols: THREE.Color[] = []
    const base = new THREE.Color(tint)
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1
      const th = rnd() * Math.PI * 2
      const rr = Math.sqrt(1 - u * u)
      const dir = new THREE.Vector3(rr * Math.cos(th), u, rr * Math.sin(th))
      // nacen JUSTO por encima del relieve (proporcional al radio) → nunca dentro
      // de montañas, y caen poco (carga rápida, sin explosiones)
      const dist = radius * (1.13 + rnd() * 0.06)
      // ley de potencia → muchas pequeñas, pocas grandes (todos los tamaños)
      const scale = minScale + Math.pow(rnd(), 2.0) * (maxScale - minScale)
      inst.push({
        key: i,
        position: [center[0] + dir.x * dist, center[1] + dir.y * dist, center[2] + dir.z * dist],
        rotation: [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28],
        scale: [scale, scale, scale],
      })
      cols.push(base.clone().offsetHSL((rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.12, (rnd() - 0.5) * 0.24))
    }
    return { instances: inst, colors: cols }
  }, [count, minScale, maxScale, seed, center, radius, tint])

  useEffect(() => {
    const m = meshRef.current
    if (!m) return
    colors.forEach((c, i) => m.setColorAt(i, c))
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [colors])

  return (
    <InstancedRigidBodies
      instances={instances}
      colliders="ball"
      friction={0.9}
      restitution={0.08}
      linearDamping={0.15}
      angularDamping={0.25}
    >
      <instancedMesh ref={meshRef} args={[geom, mat, count]} frustumCulled={false} />
    </InstancedRigidBodies>
  )
}
