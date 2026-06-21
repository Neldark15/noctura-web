import { useMemo } from 'react'
import { Outlines, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { toonGradient, MOON_RADIUS } from './toon'

const UP = new THREE.Vector3(0, 1, 0)

/**
 * Tienda japonesa antigua (estilo machiya) low-poly cel-shaded:
 * cuerpo de madera + techo piramidal con aleros + farol rojo + nombre flotante.
 * Se "para" sobre la superficie esférica de la luna orientándose a su normal.
 */
export default function Shop({
  dir,
  name,
  tint = '#c79a6b',
  roofTint = '#46506e',
}: {
  dir: THREE.Vector3
  name: string
  tint?: string
  roofTint?: string
}) {
  const gradient = useMemo(() => toonGradient(), [])

  // posición sobre la superficie + orientación con el eje Y local hacia afuera
  const { position, quaternion } = useMemo(() => {
    const d = dir.clone().normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(UP, d)
    const p = d.clone().multiplyScalar(MOON_RADIUS - 0.01)
    return { position: p, quaternion: q }
  }, [dir])

  const w = 0.16
  const h = 0.15
  const depth = 0.15
  const roofH = 0.1
  const roofR = 0.16

  return (
    <group position={position} quaternion={quaternion}>
      {/* cuerpo de madera */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, depth]} />
        <meshToonMaterial color={tint} gradientMap={gradient} />
        <Outlines thickness={1.5} color="#2a1d10" />
      </mesh>

      {/* techo piramidal con aleros (cono de 4 lados girado 45°) */}
      <mesh position={[0, h + roofH / 2 - 0.012, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[roofR, roofH, 4]} />
        <meshToonMaterial color={roofTint} gradientMap={gradient} />
        <Outlines thickness={1.5} color="#10131f" />
      </mesh>

      {/* farol rojo (brilla con el bloom) */}
      <mesh position={[w / 2 + 0.02, h * 0.6, depth / 2 + 0.02]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshToonMaterial
          color="#ff5a4d"
          emissive="#ff2a1a"
          emissiveIntensity={0.9}
          gradientMap={gradient}
        />
      </mesh>

      {/* nombre de la tienda, siempre mirando a la cámara */}
      <Billboard position={[0, h + roofH + 0.07, 0]}>
        <Text
          fontSize={0.06}
          color="#fff3df"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.006}
          outlineColor="#15172a"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  )
}
