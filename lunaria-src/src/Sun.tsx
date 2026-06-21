import { forwardRef, useMemo } from 'react'
import * as THREE from 'three'
import { SUN } from './bodies'

/** textura radial suave para la corona/halo (aditiva) */
function makeGlow() {
  const s = 128
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')!
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,244,214,1)')
  g.addColorStop(0.25, 'rgba(255,210,130,0.7)')
  g.addColorStop(0.6, 'rgba(255,150,70,0.18)')
  g.addColorStop(1, 'rgba(255,120,40,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(cv)
  tex.needsUpdate = true
  return tex
}

/**
 * Sol lejano (~350u): núcleo emisivo (MeshBasicMaterial con color >1 y
 * toneMapped=false → dispara el Bloom) + dos coronas aditivas (billboards). El
 * `ref` apunta al núcleo para los GodRays. `fog={false}` en todo (está lejísimos).
 */
const Sun = forwardRef<THREE.Mesh>(function Sun(_, ref) {
  const glow = useMemo(() => makeGlow(), [])

  return (
    <group position={[SUN.center.x, SUN.center.y, SUN.center.z]}>
      <mesh ref={ref}>
        <sphereGeometry args={[SUN.radius, 32, 24]} />
        <meshBasicMaterial color={new THREE.Color(3.6, 2.5, 1.15)} toneMapped={false} fog={false} />
      </mesh>

      <sprite scale={[SUN.radius * 3.6, SUN.radius * 3.6, 1]}>
        <spriteMaterial
          map={glow}
          color="#ffd9a0"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
          toneMapped={false}
          opacity={0.72}
        />
      </sprite>
      <sprite scale={[SUN.radius * 5.6, SUN.radius * 5.6, 1]}>
        <spriteMaterial
          map={glow}
          color="#ff9a55"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
          toneMapped={false}
          opacity={0.3}
        />
      </sprite>
    </group>
  )
})

export default Sun
