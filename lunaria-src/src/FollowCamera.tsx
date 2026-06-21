import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { roverRef } from './roverRef'
import { localUp } from './bodies'
import { activeBody, inTransit, travel } from './travel'
import { view } from './view'

/**
 * Cámara de 3ª persona. En WALK: trailing-cam centrada en el personaje, con la
 * dirección horizontal `back` (del personaje hacia la cámara) mantenida por
 * TRANSPORTE PARALELO sobre la esfera — se reproyecta al plano tangente cada
 * frame en vez de reconstruirse desde un "arriba global" (que se vuelve singular
 * cerca de los polos y hacía que la cámara se torciera y el personaje se fuera de
 * lado). Publica `view.forward = -back` para que el Rover avance EXACTO hacia donde
 * mira la cámara → mantener W va en línea recta. Arrastra para rotar, rueda zoom.
 * En WARP: detrás del rayo mirando hacia adelante.
 */
export default function FollowCamera() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  const back = useRef(new THREE.Vector3(0, 0, 1)) // dir horizontal personaje→cámara (tangente)
  const pol = useRef(1.05)
  const dist = useRef(5)
  const azDelta = useRef(0) // rotación de azimut pendiente (del arrastre)
  const inited = useRef(false)
  const follow = useRef(new THREE.Vector3()) // punto de seguimiento SUAVIZADO
  const followReady = useRef(false)

  const v = useMemo(
    () => ({
      p: new THREE.Vector3(),
      n: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      look: new THREE.Vector3(),
      dir: new THREE.Vector3(),
    }),
    [],
  )

  // arrastrar para rotar + rueda para zoom
  useEffect(() => {
    const el = gl.domElement
    let dragging = false
    let lx = 0
    let ly = 0
    const down = (e: PointerEvent) => {
      dragging = true
      lx = e.clientX
      ly = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      azDelta.current -= (e.clientX - lx) * 0.005
      pol.current = THREE.MathUtils.clamp(pol.current - (e.clientY - ly) * 0.005, 0.35, 1.45)
      lx = e.clientX
      ly = e.clientY
    }
    const up = () => {
      dragging = false
    }
    const wheel = (e: WheelEvent) => {
      dist.current = THREE.MathUtils.clamp(dist.current + e.deltaY * 0.012, 2.2, 12)
      e.preventDefault()
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('wheel', wheel)
      camera.up.set(0, 1, 0)
    }
  }, [gl, camera])

  // reproyecta `back` al plano tangente; si queda degenerado lo re-deriva
  const reTangent = () => {
    const n = v.n
    back.current.addScaledVector(n, -back.current.dot(n))
    if (back.current.lengthSq() < 1e-6) {
      back.current.set(0, 0, 1).addScaledVector(n, -n.z)
      if (back.current.lengthSq() < 1e-6) back.current.set(1, 0, 0).addScaledVector(n, -n.x)
    }
    back.current.normalize()
  }

  useFrame((_, dt) => {
    const api = roverRef.current
    if (!api) return

    const t = api.translation()
    v.p.set(t.x, t.y, t.z)

    // ===== WARP: detrás del rayo, mirando hacia adelante =====
    if (inTransit()) {
      v.dir.copy(travel.dir)
      v.desired.copy(v.p).addScaledVector(v.dir, -7)
      v.desired.y += 2.2
      camera.position.lerp(v.desired, 1 - Math.pow(0.0015, dt))
      v.look.copy(v.p).addScaledVector(v.dir, 8)
      camera.up.set(0, 1, 0)
      camera.lookAt(v.look)
      followReady.current = false // al volver a WALK, re-encaja sin barrido
      return
    }

    // ===== WALK: trailing-cam con transporte paralelo =====
    // Punto de seguimiento SUAVIZADO: filtra el jitter de física (arco del salto,
    // rodar sobre el relieve al correr, micro-correcciones anti-tunnel y los pasos
    // del solver). La cámara y el lookAt usan este MISMO punto → se mueven juntos
    // y no tiemblan. (Antes el lookAt usaba la posición cruda → temblor.)
    if (!followReady.current) {
      follow.current.copy(v.p)
      followReady.current = true
    } else {
      follow.current.lerp(v.p, Math.min(1, 14 * dt))
    }
    const fp = follow.current

    localUp(fp, v.n, activeBody(fp))

    if (!inited.current) {
      back.current.subVectors(camera.position, fp)
      reTangent()
      inited.current = true
    } else {
      reTangent() // transporte paralelo: mantener tangente al moverse
    }

    // aplicar rotación del arrastre alrededor de la normal
    if (azDelta.current !== 0) {
      back.current.applyAxisAngle(v.n, azDelta.current)
      azDelta.current = 0
      reTangent()
    }

    // publicar el "adelante" tangente para el Rover (= hacia donde mira la cámara)
    view.forward.copy(back.current).multiplyScalar(-1)

    const sp = Math.sin(pol.current)
    const cp = Math.cos(pol.current)
    v.desired
      .copy(fp)
      .addScaledVector(back.current, dist.current * sp)
      .addScaledVector(v.n, dist.current * cp)

    // el suavizado ya vive en `follow` → la cámara puede ir rígida al objetivo
    // (sin doble lag) y queda firme
    camera.position.copy(v.desired)

    v.look.copy(fp).addScaledVector(v.n, 0.8)
    camera.up.copy(v.n)
    camera.lookAt(v.look)
  })

  return null
}
