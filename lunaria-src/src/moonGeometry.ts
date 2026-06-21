import * as THREE from 'three'
import { MOON_RADIUS } from './toon'

// hash determinista 0..1 (sin Math.random, estable entre recargas)
function hash01(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453
  return s - Math.floor(s)
}

// ruido de valor 3D suave para micro-relieve orgánico
function valueNoise(x: number, y: number, z: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z)
  const xf = x - xi,
    yf = y - yi,
    zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const w = zf * zf * (3 - 2 * zf)
  const h = (i: number, j: number, k: number) => hash01(i * 1.0 + j * 57.0 + k * 113.0)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const x00 = lerp(h(xi, yi, zi), h(xi + 1, yi, zi), u)
  const x10 = lerp(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u)
  const x01 = lerp(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u)
  const x11 = lerp(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u)
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w)
}

// fbm (varias octavas) → 0..~0.94, para mares y variación de tono
function fbm(x: number, y: number, z: number) {
  let f = 0,
    amp = 0.5,
    freq = 1
  for (let o = 0; o < 4; o++) {
    f += amp * valueNoise(x * freq, y * freq, z * freq)
    freq *= 2
    amp *= 0.5
  }
  return f
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// búsqueda binaria: primer índice con arr[i] >= target (para culling por latitud)
function lowerBound(arr: Float64Array, n: number, target: number) {
  let lo = 0,
    hi = n
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] < target) lo = mid + 1
    else hi = mid
  }
  return lo
}

/**
 * Construye la geometría de la luna (esfera + cráteres + micro-relieve) a la
 * resolución pedida. Es DETERMINISTA: la malla visual (detalle alto) y el
 * collider de física (detalle bajo) salen idénticos en forma, así la física
 * coincide con lo que se ve y el rover siente los cráteres.
 *
 * La DENSIDAD del relieve escala con el radio (factor RB respecto a la luna
 * original de radio 4.8): al agrandar la luna, NO se estira la textura — se
 * añade más terreno (≈RB² más cráteres) y el ruido sube de frecuencia, así que
 * el detalle por área (y el aspecto de cráteres/mares) se mantiene idéntico.
 *
 * @param detail  subdivisiones del icosaedro (≈144 visual, ≈96 colisión)
 * @param withMicro  incluir el micro-relieve fino (solo útil en alta resolución)
 * @param withColor  escribir albedo por vértice (mares, eyección, rayos) → solo la malla visual
 */
export function buildMoonGeometry(detail: number, withMicro = true, withColor = false): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(MOON_RADIUS, detail)
  const pos = g.attributes.position as THREE.BufferAttribute

  // RB: densidad/escala relativa a la luna original (radio 4.8)
  const RB = MOON_RADIUS / 4.8
  // SCALE convierte el desplazamiento (relativo) a unidades de mundo. Se mantiene
  // la fórmula original: combinada con radios/RB deja la PROFUNDIDAD de cráter
  // constante en mundo (los dos factores RB se cancelan).
  const SCALE = MOON_RADIUS / 1.6
  // las amplitudes de ondulación/colinas/micro se dividen por RB para compensar
  // el crecimiento de SCALE → misma amplitud en MUNDO, solo más frecuencia.
  const AMP = 1 / RB

  // ===== campo de cráteres (espiral de Fibonacci), densidad ∝ RB² =====
  const nC = Math.max(60, Math.round(60 * RB * RB))
  const golden = Math.PI * (3 - Math.sqrt(5))
  const cxA = new Float64Array(nC)
  const cyA = new Float64Array(nC)
  const czA = new Float64Array(nC)
  const crA = new Float64Array(nC) // radio (chord, ya dividido por RB)
  for (let i = 0; i < nC; i++) {
    const y = 1 - (i / (nC - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    cxA[i] = Math.cos(theta) * r
    cyA[i] = y
    czA[i] = Math.sin(theta) * r
    const t = hash01(i + 0.5)
    crA[i] = (0.03 + t * t * 0.17) / RB // mismo tamaño en MUNDO → más cráteres, no más grandes
  }
  // ordenar por latitud (cy) para el culling por banda
  const order = Array.from({ length: nC }, (_, i) => i).sort((a, b) => cyA[a] - cyA[b])
  const sx = new Float64Array(nC),
    sy = new Float64Array(nC),
    sz = new Float64Array(nC),
    sr = new Float64Array(nC)
  let maxRad = 0
  for (let k = 0; k < nC; k++) {
    const i = order[k]
    sx[k] = cxA[i]
    sy[k] = cyA[i]
    sz[k] = czA[i]
    sr[k] = crA[i]
    if (crA[i] > maxRad) maxRad = crA[i]
  }

  // ===== cráteres "jóvenes" con sistema de RAYOS (los más grandes, cap 10) =====
  type Ray = { cx: number; cy: number; cz: number; reach: number; cosReach: number; t1: THREE.Vector3; t2: THREE.Vector3; seed: number }
  const rays: Ray[] = []
  if (withColor) {
    const up = new THREE.Vector3(0, 1, 0)
    const altUp = new THREE.Vector3(1, 0, 0)
    const c = new THREE.Vector3()
    for (let k = nC - 1; k >= 0 && rays.length < 10; k--) {
      if (sr[k] < 0.12 / RB) continue
      c.set(sx[k], sy[k], sz[k])
      const t1 = new THREE.Vector3().crossVectors(Math.abs(c.y) > 0.95 ? altUp : up, c).normalize()
      const t2 = new THREE.Vector3().crossVectors(c, t1).normalize()
      const ang = 2 * Math.asin(Math.min(1, sr[k] / 2))
      const reach = ang * 7
      rays.push({ cx: c.x, cy: c.y, cz: c.z, reach, cosReach: Math.cos(reach), t1, t2, seed: hash01(k + 3.7) })
    }
  }

  // ===== paleta de albedo lunar (frío plateado) =====
  const colAttr = withColor ? new Float32Array(pos.count * 3) : null
  const cHighland = new THREE.Color('#c8ccd8')
  const cMaria = new THREE.Color('#565c6e')
  const tmp = new THREE.Color()

  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    let displ = 0

    // ondulación grande + colinas medianas (frecuencia ×RB, amplitud ÷RB)
    displ += AMP * 0.03 * Math.sin(v.x * 4 * RB + v.y * 3 * RB) * Math.cos(v.z * 3.5 * RB)
    displ +=
      AMP * 0.014 * Math.sin(v.x * 11 * RB + 1.3) * Math.sin(v.y * 9 * RB + 2.1) * Math.sin(v.z * 10 * RB)

    let floorMul = 1 // oscurece el suelo del cráter
    let bright = 0 // borde/eyección/rayos (empuja a blanco)

    // cráteres: solo los de la banda de latitud cercana (culling) → rápido
    const ny = v.y
    let k = lowerBound(sy, nC, ny - maxRad)
    for (; k < nC && sy[k] <= ny + maxRad; k++) {
      const dx = v.x - sx[k],
        dy = v.y - sy[k],
        dz = v.z - sz[k]
      const d2 = dx * dx + dy * dy + dz * dz
      const rad = sr[k]
      if (d2 < rad * rad) {
        const d = Math.sqrt(d2)
        const t = d / rad
        const depth = rad * 0.32
        displ += -depth * (1 - t * t)
        const rim = depth * 0.7 * Math.exp(-((t - 0.9) ** 2) * 70)
        displ += rim
        if (withColor) {
          floorMul *= 0.72 + 0.28 * t * t
          bright += Math.exp(-((t - 0.92) ** 2) * 60) * 0.18
        }
      } else if (withColor && d2 < (rad * 1.7) * (rad * 1.7)) {
        const d = Math.sqrt(d2)
        bright += (1 - (d - rad) / (rad * 0.7)) * 0.07
      }
    }

    // micro-relieve facetado (frecuencia ×RB, amplitud ÷RB)
    if (withMicro) {
      displ += (valueNoise(v.x * 22 * RB, v.y * 22 * RB, v.z * 22 * RB) - 0.5) * 0.02 * AMP
      displ += (valueNoise(v.x * 48 * RB, v.y * 48 * RB, v.z * 48 * RB) - 0.5) * 0.008 * AMP
    }

    // ===== ALBEDO POR VÉRTICE (mismas texturas, frecuencia ×RB) =====
    if (withColor && colAttr) {
      const m = fbm(v.x * 1.4 * RB + 11, v.y * 1.4 * RB - 7, v.z * 1.4 * RB + 3)
      const maria = smoothstep(0.52, 0.66, m)
      tmp.copy(cHighland).lerp(cMaria, maria)

      const tone = 0.9 + 0.16 * fbm(v.x * 2.3 * RB - 5, v.y * 2.3 * RB + 9, v.z * 2.3 * RB - 2)
      const speck = (valueNoise(v.x * 40 * RB, v.y * 40 * RB, v.z * 40 * RB) - 0.5) * 0.06
      tmp.multiplyScalar(floorMul * tone)

      // rayos de eyección (early-out por v·c antes de la trigonometría cara)
      for (let r = 0; r < rays.length; r++) {
        const rc = rays[r]
        const dot = v.x * rc.cx + v.y * rc.cy + v.z * rc.cz
        if (dot <= rc.cosReach) continue // fuera de alcance → sin trig
        const a = Math.acos(Math.min(1, dot))
        const phi = Math.atan2(v.dot(rc.t2), v.dot(rc.t1))
        let s = Math.abs(Math.sin(phi * 7 + rc.seed * 6.28))
        s = s * 0.7 + 0.3 * Math.abs(Math.sin(phi * 15 + rc.seed * 3))
        const ray = smoothstep(0.74, 0.97, s) * (1 - a / rc.reach)
        bright += ray * 0.3
      }

      const add = bright + speck
      colAttr[i * 3] = Math.min(1.1, tmp.r + add)
      colAttr[i * 3 + 1] = Math.min(1.1, tmp.g + add)
      colAttr[i * 3 + 2] = Math.min(1.1, tmp.b + add)
    }

    v.multiplyScalar(MOON_RADIUS + displ * SCALE)
    pos.setXYZ(i, v.x, v.y, v.z)
  }

  if (colAttr) g.setAttribute('color', new THREE.BufferAttribute(colAttr, 3))
  g.computeVertexNormals()
  return g
}
