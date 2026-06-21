import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { roverRef } from './roverRef'
import { localUp } from './bodies'
import { activeBody, inTransit } from './travel'

const N = 180 // tamaño del pool de partículas
const ROVER_R = 0.13 // radio del rover (para el contacto y soltar el polvo)
const GROUND_MARGIN = 0.07 // tolerancia de "está tocando el suelo"

const VERT = /* glsl */ `
  attribute float aAge;
  varying float vA;
  uniform float uScale;
  void main() {
    vA = aAge;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float grow = 1.0 + aAge * 2.2;            // el polvo se expande al envejecer
    gl_PointSize = uScale * grow / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */ `
  varying float vA;
  uniform vec3 uColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    float a = soft * (1.0 - vA) * 0.55;        // se desvanece con la edad
    gl_FragColor = vec4(uColor, a);
  }
`

/**
 * Polvo lunar: cuando el rover rueda EN CONTACTO con la superficie, suelta
 * partículas en el punto de contacto que se expanden y se desvanecen.
 * El contacto se detecta con un rayo corto hacia el centro de la luna, así no
 * sale polvo si el rover va por el aire.
 */
export default function Dust() {
  const { world, rapier } = useRapier()

  const data = useMemo(() => {
    const positions = new Float32Array(N * 3)
    const ages = new Float32Array(N).fill(1) // 1 = inactiva (alpha 0)
    const vel = new Float32Array(N * 3)
    const life = new Float32Array(N).fill(1)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aAge', new THREE.BufferAttribute(ages, 1))
    geo.frustumCulled = false

    const mat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 120 }, uColor: { value: new THREE.Color('#d8dae6') } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    })

    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    return { positions, ages, vel, life, geo, points }
  }, [])

  const cursor = useRef(0)
  const ray = useMemo(
    () => new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }),
    [rapier],
  )
  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      n: new THREE.Vector3(),
      v: new THREE.Vector3(),
      vt: new THREE.Vector3(),
    }),
    [],
  )

  useFrame((_, dt) => {
    const api = roverRef.current
    const { positions, ages, vel, life, geo } = data

    if (api && !inTransit()) {
      const t = api.translation()
      tmp.p.set(t.x, t.y, t.z)
      localUp(tmp.p, tmp.n, activeBody(tmp.p))
      const lv = api.linvel()
      tmp.v.set(lv.x, lv.y, lv.z)
      tmp.vt.copy(tmp.v).addScaledVector(tmp.n, -tmp.v.dot(tmp.n)) // velocidad tangencial
      const speed = tmp.vt.length()

      // ¿está tocando el suelo? rayo desde el centro del rover hacia el centro
      // de la luna; si choca dentro del radio + margen, hay contacto.
      ray.origin.x = tmp.p.x
      ray.origin.y = tmp.p.y
      ray.origin.z = tmp.p.z
      ray.dir.x = -tmp.n.x
      ray.dir.y = -tmp.n.y
      ray.dir.z = -tmp.n.z
      const maxToi = ROVER_R + GROUND_MARGIN + 0.05
      const hit = world.castRay(ray, maxToi, true, undefined, undefined, undefined, api)
      // la propiedad de distancia es `timeOfImpact` (rapier nuevo) o `toi` (viejo)
      const toi = hit ? ((hit as { timeOfImpact?: number; toi?: number }).timeOfImpact ?? (hit as { toi?: number }).toi ?? Infinity) : Infinity
      const grounded = toi <= ROVER_R + GROUND_MARGIN

      if (grounded && speed > 0.7) {
        const spawn = Math.min(4, 1 + Math.floor(speed))
        const back = -0.35 / Math.max(speed, 0.001)
        for (let s = 0; s < spawn; s++) {
          const i = cursor.current % N
          cursor.current++
          positions[i * 3] = tmp.p.x - tmp.n.x * ROVER_R + (Math.random() - 0.5) * 0.06
          positions[i * 3 + 1] = tmp.p.y - tmp.n.y * ROVER_R + (Math.random() - 0.5) * 0.06
          positions[i * 3 + 2] = tmp.p.z - tmp.n.z * ROVER_R + (Math.random() - 0.5) * 0.06
          vel[i * 3] = tmp.vt.x * back + tmp.n.x * 0.22 + (Math.random() - 0.5) * 0.28
          vel[i * 3 + 1] = tmp.vt.y * back + tmp.n.y * 0.22 + (Math.random() - 0.5) * 0.28
          vel[i * 3 + 2] = tmp.vt.z * back + tmp.n.z * 0.22 + (Math.random() - 0.5) * 0.28
          ages[i] = 0
          life[i] = 0.5 + Math.random() * 0.4
        }
      }
    }

    // actualizar partículas activas
    for (let i = 0; i < N; i++) {
      if (ages[i] >= 1) continue
      ages[i] += dt / life[i]
      positions[i * 3] += vel[i * 3] * dt
      positions[i * 3 + 1] += vel[i * 3 + 1] * dt
      positions[i * 3 + 2] += vel[i * 3 + 2] * dt
      vel[i * 3] *= 0.9
      vel[i * 3 + 1] *= 0.9
      vel[i * 3 + 2] *= 0.9
    }

    geo.attributes.position.needsUpdate = true
    geo.attributes.aAge.needsUpdate = true
  })

  return <primitive object={data.points} />
}
