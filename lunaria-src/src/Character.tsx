import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'
import { localUp } from './bodies'
import { activeBody, inTransit } from './travel'
import { roverRef } from './roverRef'
import { input } from './input'
import { animDev } from './animDev'
import characterUrl from './assets/character.glb'

useGLTF.preload(characterUrl)

const ROVER_R = 0.13
const SCALE = 1.0
const FACE_OFFSET = -Math.PI / 2 // este modelo miraba 90° a la derecha; lo giramos al frente

// Mapeo de animaciones (índice del clip en el GLB). PLACEHOLDER: se ajusta cuando
// el usuario identifique cada clip con el navegador.
const CLIP = { idle: 13, walk: 6, run: 12, wave: 11 } // AJUSTAR con los números que diga el usuario
const WALK_MIN = 0.4 // velocidad para pasar a caminar
const RUN_MIN = 4.2 // velocidad para pasar a correr

/**
 * Personaje con animaciones REALES del GLB (17 clips). Usa useAnimations (mixer)
 * con crossfades. Máquina de estados idle/walk/run + saludo one-shot por velocidad
 * e input. Montado sobre el cuerpo físico (roverRef), orientado a la superficie
 * del cuerpo activo. Incluye un NAVEGADOR (animDev) para identificar los clips.
 */
export default function Character() {
  const root = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF(characterUrl)

  const model = useMemo(() => {
    const c = skeletonClone(scene)
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).frustumCulled = false
    })
    return c
  }, [scene])

  const { actions, names } = useAnimations(animations, model)
  const ready = useRef(false)
  const waveT = useRef(0)
  const heading = useRef(new THREE.Vector3(0, 0, 1))

  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      n: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      velT: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      right: new THREE.Vector3(),
      basis: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
    }),
    [],
  )

  // asegura que una acción esté sonando (en bucle, salvo one-shot)
  const ensure = (a: THREE.AnimationAction | undefined, once = false) => {
    if (!a) return
    if (!a.isRunning()) {
      a.reset()
      a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity)
      a.clampWhenFinished = once
      a.play()
    }
  }
  // mezcla el peso de una acción hacia un objetivo (crossfade por peso)
  const blend = (a: THREE.AnimationAction | undefined, target: number, k: number) => {
    if (!a) return
    a.setEffectiveWeight(THREE.MathUtils.lerp(a.getEffectiveWeight(), target, k))
  }

  useFrame((_, dt) => {
    const api = roverRef.current
    if (!api || !root.current) return

    if (inTransit()) {
      root.current.visible = false
      return
    }
    root.current.visible = true

    // --- posición y orientación sobre el cuerpo activo ---
    const t = api.translation()
    tmp.pos.set(t.x, t.y, t.z)
    localUp(tmp.pos, tmp.n, activeBody(tmp.pos))

    const lv = api.linvel()
    tmp.vel.set(lv.x, lv.y, lv.z)
    tmp.velT.copy(tmp.vel).addScaledVector(tmp.n, -tmp.vel.dot(tmp.n))
    const speed = tmp.velT.length()

    if (speed > 0.4) {
      tmp.velT.normalize()
      heading.current.lerp(tmp.velT, 1 - Math.pow(0.05, dt))
    }
    heading.current.addScaledVector(tmp.n, -heading.current.dot(tmp.n))
    if (heading.current.lengthSq() < 1e-5) heading.current.set(1, 0, 0)
    heading.current.normalize()

    tmp.fwd.copy(heading.current)
    tmp.right.crossVectors(tmp.n, tmp.fwd).normalize()
    tmp.fwd.crossVectors(tmp.right, tmp.n).normalize()
    tmp.basis.makeBasis(tmp.right, tmp.n, tmp.fwd)
    tmp.quat.setFromRotationMatrix(tmp.basis)
    root.current.quaternion.copy(tmp.quat)
    root.current.position.set(
      tmp.pos.x - tmp.n.x * ROVER_R,
      tmp.pos.y - tmp.n.y * ROVER_R,
      tmp.pos.z - tmp.n.z * ROVER_R,
    )

    if (!names.length || !actions) return
    const A = (i: number) => actions[names[i % names.length]]
    const k = 1 - Math.pow(0.0015, dt) // suavizado de la mezcla de pesos (~0.2s)

    // --- NAVEGADOR: forzar un clip para identificarlo (peso 1, los demás 0) ---
    if (animDev.preview >= 0) {
      const pn = names[animDev.preview % names.length]
      ensure(actions[pn])
      for (const nm of names) blend(actions[nm], nm === pn ? 1 : 0, k)
      return
    }

    // idle/walk/run SIEMPRE en bucle y sincronizados → al caminar el ciclo ya
    // está en una fase natural (no salta al frame 0, no "se levantan los pies")
    ensure(A(CLIP.idle))
    ensure(A(CLIP.walk))
    ensure(A(CLIP.run))
    if (!ready.current) {
      // arranca con idle a peso 1 y el resto a 0
      A(CLIP.idle)?.setEffectiveWeight(1)
      A(CLIP.walk)?.setEffectiveWeight(0)
      A(CLIP.run)?.setEffectiveWeight(0)
      ready.current = true
    }

    // saludo: one-shot disparado por input
    if (input.wave) {
      input.wave = false
      const w = A(CLIP.wave)
      if (w && waveT.current <= 0) {
        w.reset()
        w.setLoop(THREE.LoopOnce, 1)
        w.clampWhenFinished = true
        w.play()
        waveT.current = w.getClip().duration
      }
    }
    const waving = waveT.current > 0
    if (waving) waveT.current -= dt

    // pesos objetivo
    let tIdle = 0,
      tWalk = 0,
      tRun = 0
    if (waving) {
      /* loco a 0, el saludo manda */
    } else if (speed > RUN_MIN) tRun = 1
    else if (speed > WALK_MIN) tWalk = 1
    else tIdle = 1

    blend(A(CLIP.idle), tIdle, k)
    blend(A(CLIP.walk), tWalk, k)
    blend(A(CLIP.run), tRun, k)
    blend(A(CLIP.wave), waving ? 1 : 0, k)
  })

  return (
    <group ref={root}>
      <group rotation={[0, FACE_OFFSET, 0]}>
        <primitive object={model} scale={SCALE} />
      </group>
    </group>
  )
}
