import * as THREE from 'three'

// hash determinista 0..1 (estable entre recargas)
function hash01(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453
  return s - Math.floor(s)
}

function valueNoise(x: number, y: number, z: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z)
  const xf = x - xi,
    yf = y - yi,
    zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const vv = yf * yf * (3 - 2 * yf)
  const w = zf * zf * (3 - 2 * zf)
  const h = (i: number, j: number, k: number) => hash01(i * 1.0 + j * 57.0 + k * 113.0)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const x00 = lerp(h(xi, yi, zi), h(xi + 1, yi, zi), u)
  const x10 = lerp(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u)
  const x01 = lerp(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u)
  const x11 = lerp(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u)
  return lerp(lerp(x00, x10, vv), lerp(x01, x11, vv), w)
}

// fractal brownian motion (continentes orgánicos)
function fbm(x: number, y: number, z: number, oct = 5) {
  let sum = 0
  let amp = 0.5
  let f = 1
  for (let o = 0; o < oct; o++) {
    sum += amp * valueNoise(x * f, y * f, z * f)
    f *= 2
    amp *= 0.5
  }
  return sum
}

export const SEA_LEVEL = 0.0

export interface Volcano {
  dir: THREE.Vector3 // dirección unitaria del centro
  rad: number // radio angular (cuerda en la esfera unidad)
  height: number // altura del cono (fracción del radio)
}

/** Campo determinista de VOLCANES (espiral de Fibonacci + tamaños por hash). */
export function volcanoField(n = 9): Volcano[] {
  const out: Volcano[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i + 0.7
    const dir = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).normalize()
    const t = hash01(i * 3.13 + 1.7)
    out.push({ dir, rad: 0.16 + t * 0.12, height: 0.06 + t * 0.06 })
  }
  return out
}

const VOLCANOES = volcanoField()

/**
 * Planeta tipo Tierra REALISTA y DETALLADO: continentes con relieve (cordilleras
 * ridged), costas, VOLCANES (conos de basalto con cráter y lava), micro-relieve
 * fino, y colores por elevación/latitud (playa→pradera→bosque→roca→nieve + hielo).
 * El océano queda plano al nivel del mar (lo cubre una esfera de agua aparte).
 * Para `MeshStandardMaterial` (vertexColors). La MISMA malla sirve de colisión,
 * así el relieve nunca atraviesa al personaje.
 */
export function buildPlanetGeometry(radius: number, detail: number): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(radius, detail)
  const pos = g.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const v = new THREE.Vector3()

  const oceanDeep = new THREE.Color('#0e2f55')
  const sand = new THREE.Color('#c8b27a')
  const grass = new THREE.Color('#5f9b4a')
  const forest = new THREE.Color('#2f6b34')
  const dirt = new THREE.Color('#9c7e54')
  const rock = new THREE.Color('#7a6e60')
  const snow = new THREE.Color('#f0f5f8')
  const ice = new THREE.Color('#dbe8f0')
  const basalt = new THREE.Color('#39322e')
  const lava = new THREE.Color('#ff5a1e')
  const c = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    const cont = fbm(v.x * 1.7 + 11.3, v.y * 1.7 + 4.7, v.z * 1.7 - 2.1)
    const lat = Math.abs(v.y)
    let displ = SEA_LEVEL

    if (cont < 0.5) {
      displ = SEA_LEVEL
      c.copy(oceanDeep)
    } else {
      const h = (cont - 0.5) / 0.5
      const ridge = 1 - Math.abs(fbm(v.x * 5 + 20, v.y * 5, v.z * 5 - 7, 4) * 2 - 1)
      const hills = (fbm(v.x * 9 + 3, v.y * 9, v.z * 9 + 5, 3) - 0.5) * 0.02 // colinas suaves
      displ = 0.006 + h * 0.03 + ridge * ridge * h * 0.06 + Math.max(0, hills)
      const e = displ
      // biomas: regiones áridas (bajo) ↔ frondosas (alto)
      const biome = fbm(v.x * 0.9 + 40, v.y * 0.9 - 8, v.z * 0.9 + 12, 3)
      const tone = (valueNoise(v.x * 34, v.y * 34, v.z * 34) - 0.5) * 0.14 // moteado fino
      const patch = valueNoise(v.x * 6 + 50, v.y * 6, v.z * 6) // manchas de bioma
      if (e < 0.012) {
        c.copy(sand).offsetHSL(0, 0, tone * 0.6)
      } else if (e < 0.05) {
        // pradera/bosque vs estepa según bioma
        c.copy(biome > 0.5 ? grass : dirt).lerp(forest, Math.max(0, biome - 0.6) * 2)
        c.offsetHSL(0, 0.04 * (biome - 0.5), tone)
        if (patch > 0.62) c.lerp(forest, 0.5) // bosquecillos
        else if (patch < 0.32) c.lerp(dirt, 0.45) // claros secos
      } else if (e < 0.08) {
        c.copy(rock).offsetHSL(0, 0, tone)
        if (patch > 0.6) c.lerp(forest, 0.3) // vegetación en laderas
      } else {
        c.copy(rock).lerp(snow, Math.min(1, (e - 0.08) / 0.04))
      }
      if (lat > 0.64) c.lerp(snow, Math.min(1, (lat - 0.64) / 0.36) * 0.85)
    }

    // --- VOLCANES: cono de basalto + cráter con lava ---
    for (let k = 0; k < VOLCANOES.length; k++) {
      const vo = VOLCANOES[k]
      const d = v.distanceTo(vo.dir) // cuerda en la esfera unidad
      if (d < vo.rad) {
        const t = d / vo.rad // 0 centro .. 1 borde
        // cono suave (sube al centro) menos un cráter hundido en el medio
        const cone = Math.pow(1 - t, 1.5) * vo.height
        const crater = t < 0.28 ? -(1 - t / 0.28) * vo.height * 0.45 : 0
        displ = Math.max(displ, SEA_LEVEL + 0.01) + cone + crater
        // color: lava en el cráter, basalto en las laderas
        if (t < 0.22) c.copy(lava).lerp(basalt, t / 0.22)
        else c.copy(basalt).offsetHSL(0, 0, (valueNoise(v.x * 40, v.y * 40, v.z * 40) - 0.5) * 0.1)
      }
    }

    if (lat > 0.85) c.lerp(ice, Math.min(1, (lat - 0.85) / 0.15))

    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b

    // micro-relieve fino (textura de superficie) en tierra y volcanes
    if (cont >= 0.5 || displ > SEA_LEVEL + 0.005) {
      displ += (valueNoise(v.x * 16, v.y * 16, v.z * 16) - 0.5) * 0.006
      displ += (valueNoise(v.x * 38, v.y * 38, v.z * 38) - 0.5) * 0.003
      displ += (valueNoise(v.x * 72, v.y * 72, v.z * 72) - 0.5) * 0.0015 // grano fino
    }

    v.multiplyScalar(radius * (1 + displ))
    pos.setXYZ(i, v.x, v.y, v.z)
  }

  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}
