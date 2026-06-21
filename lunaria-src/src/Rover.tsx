import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, useRapier } from '@react-three/rapier'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { toonGradient } from './toon'
import { MOON, localUp } from './bodies'
import { input } from './input'
import { roverRef } from './roverRef'
import { view } from './view'
import {
  travel,
  activeBody,
  isWarping,
  finishTravel,
  computeLanding,
  WARP_CRUISE,
  WARP_RAMP,
} from './travel'

const WALK_ACCEL = 12 // respuesta al caminar
const RUN_ACCEL = 16
const WALK_MAX = 3.6
const RUN_MAX = 7
const RADIUS = 0.13
const JUMP_SPEED = 6 // impulso de salto (con gravedad baja salta más alto)
const MAX_FALL = 25 // tope de velocidad de caída (anti-tunneling)

/**
 * La sonda/rover del jugador. Camina por la superficie del cuerpo ACTIVO
 * (luna/planeta/sol) y, durante el VIAJE, se convierte en un rayo que vuela al
 * destino.
 *
 * Walk: control tangente directo (independiente de la masa) + FIJADO del radio
 * a la superficie cada frame (rayo desde fuera del cuerpo activo → inmune a
 * tunneling; no se eleva ni se hunde, exista o no gravedad). Todo relativo al
 * CENTRO del cuerpo activo (ya no se asume el origen).
 *
 * Warp: el WarpDriver toma control y mueve el cuerpo hacia el punto de
 * aterrizaje a gran velocidad; al llegar, finishTravel() devuelve a walk.
 */
export default function Rover() {
  const body = roverRef
  const ball = useRef<THREE.Mesh>(null!)
  const gradient = useMemo(() => toonGradient(), [])
  const { world, rapier } = useRapier()
  const ray = useMemo(
    () => new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }),
    [rapier],
  )

  const v = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      camDir: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      right: new THREE.Vector3(),
      move: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      tang: new THREE.Vector3(),
      toLanding: new THREE.Vector3(),
    }),
    [],
  )

  useFrame((_, dt) => {
    const api = body.current
    if (!api) return

    // la pelota se oculta durante el viaje (se ve el rayo en su lugar)
    if (ball.current) ball.current.visible = !isWarping()

    const t = api.translation()
    v.pos.set(t.x, t.y, t.z)

    // ===== WARP: vuela al destino como un rayo (sin pegado-al-suelo) =====
    if (isWarping()) {
      if (!travel._hasLanding) computeLanding(v.pos)
      const dts = Math.min(dt, 0.05) // dt acotado: un pico de frame no lo dispara
      travel.t += dts
      v.toLanding.subVectors(travel.landing, v.pos)
      const dist = v.toLanding.length()
      if (dist < 0.6) {
        api.setTranslation(
          { x: travel.landing.x, y: travel.landing.y, z: travel.landing.z },
          true,
        )
        api.setLinvel({ x: 0, y: 0, z: 0 }, true)
        finishTravel()
      } else {
        v.toLanding.multiplyScalar(1 / dist) // dirección normalizada
        const ramp = Math.min(1, travel.t * WARP_RAMP)
        const speed = Math.min(WARP_CRUISE * ramp, Math.max(5, dist * 2.5)) // frena al final
        const step = Math.min(speed * dts, dist) // NUNCA se pasa del destino
        // movemos por POSICIÓN (robusto ante dt enorme); física quieta
        api.setTranslation(
          {
            x: v.pos.x + v.toLanding.x * step,
            y: v.pos.y + v.toLanding.y * step,
            z: v.pos.z + v.toLanding.z * step,
          },
          true,
        )
        api.setLinvel({ x: 0, y: 0, z: 0 }, true)
        // exponemos dirección/velocidad para la cámara y el rayo
        travel.dir.copy(v.toLanding)
        travel.speed = speed
      }
      return
    }

    // ===== WALK: relativo al cuerpo activo =====
    const ab = activeBody(v.pos)
    localUp(v.pos, v.normal, ab) // arriba local (centro del cuerpo → pos)

    const accel = input.run ? RUN_ACCEL : WALK_ACCEL
    const maxSpeed = input.run ? RUN_MAX : WALK_MAX

    // velocidad tangente META (relativa a la cámara). El "adelante" lo publica la
    // cámara (view.forward, por transporte paralelo) → avanzar con W va recto.
    v.move.set(0, 0, 0)
    if (input.forward || input.right) {
      v.fwd.copy(view.forward).addScaledVector(v.normal, -view.forward.dot(v.normal))
      if (v.fwd.lengthSq() < 1e-6) v.fwd.set(1, 0, 0).addScaledVector(v.normal, -v.normal.x)
      v.fwd.normalize()
      v.right.crossVectors(v.fwd, v.normal).normalize()
      v.move.addScaledVector(v.fwd, input.forward).addScaledVector(v.right, input.right)
      if (v.move.lengthSq() > 0) v.move.normalize().multiplyScalar(maxSpeed)
    }

    // velocidad actual: radial (gravedad/salto, física REAL) + tangente (control)
    const lv = api.linvel()
    v.vel.set(lv.x, lv.y, lv.z)
    let radialSpeed = v.vel.dot(v.normal)
    v.tang.copy(v.vel).addScaledVector(v.normal, -radialSpeed)
    v.tang.lerp(v.move, Math.min(1, accel * dt))

    // altura del suelo bajo la pelota (rayo desde fuera del relieve, hacia el centro)
    const outerR = ab.radius + Math.max(1.5, ab.radius * 0.25)
    ray.origin.x = ab.center.x + v.normal.x * outerR
    ray.origin.y = ab.center.y + v.normal.y * outerR
    ray.origin.z = ab.center.z + v.normal.z * outerR
    ray.dir.x = -v.normal.x
    ray.dir.y = -v.normal.y
    ray.dir.z = -v.normal.z
    const hit = world.castRay(ray, outerR, true, undefined, undefined, undefined, api)
    const curR = v.pos.distanceTo(ab.center) // radio respecto al CENTRO del cuerpo activo
    let floorR = -1
    if (hit) {
      const toi =
        (hit as { timeOfImpact?: number; toi?: number }).timeOfImpact ??
        (hit as { toi?: number }).toi ??
        0
      floorR = outerR - toi + RADIUS
    }
    const grounded = floorR > 0 && curR <= floorR + 0.06

    // SALTO (Espacio / botón): solo en el suelo → impulso hacia afuera
    if (grounded && input.jump) radialSpeed = JUMP_SPEED
    input.jump = false

    // SEGURIDAD anti-tunneling: por encima del suelo manda la física (cae/salta
    // en arco), pero NUNCA puede hundirse por debajo de la superficie.
    if (floorR > 0 && curR < floorR) {
      api.setTranslation(
        {
          x: ab.center.x + v.normal.x * floorR,
          y: ab.center.y + v.normal.y * floorR,
          z: ab.center.z + v.normal.z * floorR,
        },
        true,
      )
      if (radialSpeed < 0) radialSpeed = 0 // aterrizó
    }
    radialSpeed = Math.max(radialSpeed, -MAX_FALL) // tope de velocidad de caída

    // recomponemos: radial (gravedad/salto) + tangente (movimiento)
    v.vel.copy(v.normal).multiplyScalar(radialSpeed).add(v.tang)
    api.setLinvel({ x: v.vel.x, y: v.vel.y, z: v.vel.z }, true)
  })

  return (
    <RigidBody
      ref={body}
      colliders="ball"
      ccd
      position={[MOON.center.x, MOON.center.y + MOON.radius + RADIUS + 0.05, MOON.center.z]}
      linearDamping={0.2}
      angularDamping={0.5}
      friction={1.2}
      restitution={0.05}
    >
      {/* la pelota dorada del jugador: cel-shaded con contorno */}
      <mesh ref={ball}>
        <sphereGeometry args={[RADIUS, 24, 24]} />
        <meshToonMaterial color="#ffb454" gradientMap={gradient} />
        <Outlines thickness={2.5} color="#2a1d00" />
      </mesh>
    </RigidBody>
  )
}
