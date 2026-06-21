import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// PRNG determinista
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uScale;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a);
  }
`

/**
 * Cielo estrellado intenso + banda de Vía Láctea (estrellas densas + nebulosa),
 * como sistema de partículas. Blending aditivo: con el bloom, las zonas densas
 * brillan. Usa su propio material, así la niebla de la escena no lo apaga.
 */
export default function Galaxy() {
  const object = useMemo(() => {
    const rnd = mulberry32(777)
    const BG = 5000 // estrellas de fondo
    const MW = 11000 // estrellas de la banda
    const NEB = 900 // "nubes" de nebulosa (puntos grandes y tenues)
    const total = BG + MW + NEB
    const pos = new Float32Array(total * 3)
    const col = new Float32Array(total * 3)
    const siz = new Float32Array(total)
    const R = 1000 // esfera grande: el cielo sigue a la cámara y rodea ambos planetas
    const c = new THREE.Color()
    let o = 0

    // plano galáctico (inclinado) y base tangente
    const Nrm = new THREE.Vector3(0.25, 1.0, 0.4).normalize()
    const t1 = new THREE.Vector3().crossVectors(Nrm, new THREE.Vector3(1, 0, 0)).normalize()
    const t2 = new THREE.Vector3().crossVectors(Nrm, t1).normalize()
    const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2 // ~normal
    const dir = new THREE.Vector3()

    // --- estrellas de fondo (uniformes en la esfera) ---
    for (let i = 0; i < BG; i++) {
      const u = rnd() * 2 - 1
      const th = rnd() * Math.PI * 2
      const r = Math.sqrt(1 - u * u)
      pos[o * 3] = r * Math.cos(th) * R
      pos[o * 3 + 1] = u * R
      pos[o * 3 + 2] = r * Math.sin(th) * R
      const t = rnd()
      if (t < 0.72) c.setRGB(1, 1, 1)
      else if (t < 0.88) c.setRGB(0.7, 0.82, 1)
      else c.setRGB(1, 0.86, 0.7)
      const b = 0.55 + rnd() * 0.55
      col[o * 3] = c.r * b
      col[o * 3 + 1] = c.g * b
      col[o * 3 + 2] = c.b * b
      siz[o] = rnd() < 0.07 ? 1.8 + rnd() * 2.6 : 0.45 + rnd() * 1.0
      o++
    }

    // --- estrellas densas de la Vía Láctea (banda estrecha) ---
    const palette = [
      [1, 1, 1],
      [0.62, 0.74, 1],
      [0.8, 0.66, 1],
      [1, 0.74, 0.86],
      [0.7, 0.85, 1],
    ]
    for (let i = 0; i < MW; i++) {
      const a = rnd() * Math.PI * 2
      const spread = gauss() * 0.12 // banda más estrecha = más definida
      dir
        .copy(t1)
        .multiplyScalar(Math.cos(a))
        .addScaledVector(t2, Math.sin(a))
        .addScaledVector(Nrm, spread)
        .normalize()
      const RR = R * (0.95 + rnd() * 0.1)
      pos[o * 3] = dir.x * RR
      pos[o * 3 + 1] = dir.y * RR
      pos[o * 3 + 2] = dir.z * RR
      const p = palette[(rnd() * palette.length) | 0]
      const clump = 0.3 + 0.7 * Math.pow(Math.abs(Math.sin(a * 6.0) * Math.sin(a * 2.3 + 1.0)), 1.4)
      const b = (0.5 + rnd() * 0.7) * clump
      col[o * 3] = p[0] * b
      col[o * 3 + 1] = p[1] * b
      col[o * 3 + 2] = p[2] * b
      siz[o] = 0.35 + rnd() * 0.9
      o++
    }

    // --- nebulosa: puntos grandes y muy tenues a lo largo de la banda ---
    const nebPalette = [
      [0.35, 0.5, 1.0],
      [0.7, 0.45, 1.0],
      [1.0, 0.45, 0.7],
      [0.45, 0.7, 1.0],
    ]
    for (let i = 0; i < NEB; i++) {
      const a = rnd() * Math.PI * 2
      const spread = gauss() * 0.18
      dir
        .copy(t1)
        .multiplyScalar(Math.cos(a))
        .addScaledVector(t2, Math.sin(a))
        .addScaledVector(Nrm, spread)
        .normalize()
      const RR = R * 1.02
      pos[o * 3] = dir.x * RR
      pos[o * 3 + 1] = dir.y * RR
      pos[o * 3 + 2] = dir.z * RR
      const p = nebPalette[(rnd() * nebPalette.length) | 0]
      const clump = 0.3 + 0.7 * Math.pow(Math.abs(Math.sin(a * 5.0 + 0.5) * Math.sin(a * 2.0)), 1.6)
      const b = (0.05 + rnd() * 0.12) * clump
      col[o * 3] = p[0] * b
      col[o * 3 + 1] = p[1] * b
      col[o * 3 + 2] = p[2] * b
      siz[o] = 8 + rnd() * 16 // puntos grandes = nubes difusas
      o++
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(siz, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 6000 } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    return points
  }, [])

  // El cielo SIGUE a la cámara (skybox): centrado siempre en el espectador, así
  // las estrellas rodean al jugador esté en la luna o en la Tierra, y quedan
  // siempre detrás de los cuerpos (R grande).
  const camera = useThree((s) => s.camera)
  const ref = useRef<THREE.Points>(object)
  useFrame(() => {
    ref.current.position.copy(camera.position)
  })

  return <primitive object={object} ref={ref} />
}
