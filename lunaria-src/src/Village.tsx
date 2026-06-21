import { useMemo } from 'react'
import * as THREE from 'three'
import Shop from './Shop'

/**
 * Mini pueblo japonés sobre la luna. Las tiendas se agrupan en un "casquete"
 * (un cúmulo) alrededor de un eje, distribuidas con la espiral dorada.
 * Cada una tiene su nombre (en romaji por ahora; ver nota en README sobre kanji).
 */
const SHOPS = [
  { name: 'Tsuki Chaya', tint: '#c79a6b', roof: '#46506e' }, // casa de té de la luna
  { name: 'Hoshi Ramen', tint: '#b5835a', roof: '#7a3b3b' }, // ramen de las estrellas
  { name: 'Yumeya', tint: '#caa173', roof: '#3f4a63' }, // tienda de sueños
  { name: 'Sakura-do', tint: '#bd8e5e', roof: '#7a4a5e' },
  { name: 'Akari', tint: '#c99a66', roof: '#3d5a4a' }, // farol / luz
  { name: 'Kitsune', tint: '#b07d4f', roof: '#5a4a2e' },
  { name: 'Mochiya', tint: '#cfa676', roof: '#46506e' },
  { name: 'Hoshizora', tint: '#bb8d5c', roof: '#4a3b6a' }, // cielo estrellado
]

// eje central del pueblo (zona frontal-superior de la luna, lejos del polo
// donde aparece el rover)
const CENTER = new THREE.Vector3(0.35, 0.45, 0.82).normalize()
const CAP = 0.5 // radio angular del cúmulo (radianes)

export default function Village() {
  const shops = useMemo(() => {
    // base tangente para el casquete
    const t1 = new THREE.Vector3().crossVectors(CENTER, new THREE.Vector3(0, 1, 0))
    if (t1.lengthSq() < 1e-4) t1.set(1, 0, 0)
    t1.normalize()
    const t2 = new THREE.Vector3().crossVectors(CENTER, t1).normalize()

    const N = SHOPS.length
    const golden = Math.PI * (3 - Math.sqrt(5))

    return SHOPS.map((s, i) => {
      const a = i * golden
      const rr = CAP * Math.sqrt((i + 0.5) / N) // radio dentro del casquete
      const dir = CENTER.clone()
        .multiplyScalar(Math.cos(rr))
        .addScaledVector(t1, Math.cos(a) * Math.sin(rr))
        .addScaledVector(t2, Math.sin(a) * Math.sin(rr))
        .normalize()
      return { ...s, dir }
    })
  }, [])

  return (
    <group>
      {shops.map((s, i) => (
        <Shop key={i} dir={s.dir} name={s.name} tint={s.tint} roofTint={s.roof} />
      ))}
    </group>
  )
}
