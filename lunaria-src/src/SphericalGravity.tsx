import { useMemo } from 'react'
import { useBeforePhysicsStep, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { settings } from './settings'
import { BODIES, GRAVITY_ANCHOR } from './bodies'
import { roverRef } from './roverRef'
import { isWarping } from './travel'

/**
 * Gravedad MULTI-CUERPO: cada cuerpo dinámico es atraído hacia el centro del
 * cuerpo celeste DOMINANTE (el de menor distancia a su superficie). Es lo que
 * convierte luna/planeta/sol en mundos por los que se puede caminar.
 *
 * Se aplica como ACELERACIÓN (Δv = a·dt), NO como fuerza·masa: rapier reporta
 * mass()=0 con estos colliders y la fuerza saldría nula. La aceleración por
 * cuerpo = surfaceGravity · gMul, con gMul = settings.gravity / GRAVITY_ANCHOR
 * (=1.0 en el default 14), así el slider conserva su significado.
 *
 * El rover se SALTA durante el warp (su velocidad la controla el WarpDriver).
 */
export default function SphericalGravity() {
  const { world } = useRapier()
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])

  useBeforePhysicsStep(() => {
    const gMul = settings.gravity / GRAVITY_ANCHOR
    if (gMul <= 0) return
    const dt = world.timestep
    const roverApi = roverRef.current
    const skipRover = isWarping() && roverApi

    world.forEachRigidBody((body) => {
      if (!body.isDynamic()) return
      if (skipRover && body.handle === roverApi.handle) return

      const p = body.translation()
      pos.set(p.x, p.y, p.z)

      // cuerpo dominante (menor gap de superficie)
      let best = BODIES[0]
      let bestGap = Infinity
      for (let i = 0; i < BODIES.length; i++) {
        const b = BODIES[i]
        const gap = tmp.subVectors(pos, b.center).length() - b.radius
        if (gap < bestGap) {
          bestGap = gap
          best = b
        }
      }

      tmp.subVectors(best.center, pos)
      const len = tmp.length()
      if (len < 1e-4) return
      tmp.multiplyScalar((best.surfaceGravity * gMul * dt) / len) // Δv hacia el centro
      const lv = body.linvel()
      body.setLinvel({ x: lv.x + tmp.x, y: lv.y + tmp.y, z: lv.z + tmp.z }, true)
    })
  })

  return null
}
