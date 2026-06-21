import { useMemo } from 'react'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { PLANET } from './bodies'
import { buildPlanetGeometry, volcanoField } from './planetGeometry'

const DETAIL = 128 // +60% de detalle; misma malla para visual y colisión

/**
 * La Tierra: terreno REALISTA y detallado (MeshStandardMaterial + colores de
 * vértice) con cordilleras, costas, bosques, nieve y VOLCANES (conos de basalto
 * con lava brillante); + un OCÉANO como esfera lisa y brillante.
 *
 * El TrimeshCollider usa EXACTAMENTE la misma geometría que se ve → el relieve
 * (montañas/volcanes) nunca atraviesa al personaje. `fog={false}` (lejos, ~300u).
 */
export default function Planet() {
  const geo = useMemo(() => buildPlanetGeometry(PLANET.radius, DETAIL), [])
  const volcanoes = useMemo(() => volcanoField(), [])

  const colliderArgs = useMemo(() => {
    const vertices = geo.attributes.position.array as Float32Array
    const count = geo.attributes.position.count
    const indices = new Uint32Array(count)
    for (let i = 0; i < count; i++) indices[i] = i
    return [vertices, indices] as [Float32Array, Uint32Array]
  }, [geo])

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[PLANET.center.x, PLANET.center.y, PLANET.center.z]}
      friction={1}
    >
      {/* terreno realista (la malla que se ve = la malla de colisión) */}
      <mesh geometry={geo} frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0} fog={false} />
      </mesh>

      {/* océano: esfera lisa y brillante al nivel del mar */}
      <mesh frustumCulled={false}>
        <sphereGeometry args={[PLANET.radius * 1.006, 160, 100]} />
        <meshStandardMaterial color="#16486f" roughness={0.12} metalness={0} fog={false} />
      </mesh>

      {/* brillo de lava en el cráter de cada volcán (resplandece con el bloom) */}
      {volcanoes.map((vo, i) => {
        const hr = PLANET.radius * (1 + 0.01 + vo.height * 0.5)
        const s = PLANET.radius * vo.rad * 0.16
        return (
          <mesh key={i} position={[vo.dir.x * hr, vo.dir.y * hr, vo.dir.z * hr]}>
            <sphereGeometry args={[s, 12, 10]} />
            <meshBasicMaterial
              color={new THREE.Color(4.5, 1.3, 0.25)}
              toneMapped={false}
              fog={false}
            />
          </mesh>
        )
      })}

      <TrimeshCollider args={colliderArgs} />
    </RigidBody>
  )
}
