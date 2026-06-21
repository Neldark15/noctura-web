import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { roverRef } from './roverRef'
import { inTransit, travel } from './travel'

/**
 * El "RAYO": durante el viaje el personaje se oculta y en su lugar se ve un haz
 * de luz que cruza el espacio — un núcleo brillante + una estela cónica que
 * apunta hacia atrás, orientada a la velocidad y estirada según la rapidez.
 * Colores >1 + AdditiveBlending → el Bloom lo hace resplandecer.
 */
export default function Rayo() {
  const group = useRef<THREE.Group>(null)
  const v = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      q: new THREE.Quaternion(),
    }),
    [],
  )

  useFrame(() => {
    const g = group.current
    const api = roverRef.current
    if (!g || !api) return
    if (!inTransit()) {
      g.visible = false
      return
    }
    g.visible = true

    const t = api.translation()
    v.pos.set(t.x, t.y, t.z)
    v.dir.copy(travel.dir) // dirección de vuelo (de travel)

    g.position.copy(v.pos)
    v.q.setFromUnitVectors(v.up, v.dir) // +Y local → dirección de vuelo
    g.quaternion.copy(v.q)
    const stretch = THREE.MathUtils.clamp(travel.speed * 0.14, 0.8, 6) // se estira con la rapidez
    g.scale.set(1, stretch, 1)
  })

  return (
    <group ref={group} visible={false}>
      {/* núcleo brillante */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 12]} />
        <meshBasicMaterial
          color={new THREE.Color(4, 4.6, 6.5)}
          toneMapped={false}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      {/* estela cónica hacia atrás (−Y) */}
      <mesh position={[0, -0.55, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.14, 1.3, 16, 1, true]} />
        <meshBasicMaterial
          color={new THREE.Color(2.2, 3.2, 6)}
          toneMapped={false}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          fog={false}
        />
      </mesh>
    </group>
  )
}
