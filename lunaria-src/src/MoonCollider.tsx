import { useMemo } from 'react'
import { TrimeshCollider } from '@react-three/rapier'
import { buildMoonGeometry } from './moonGeometry'

/**
 * Collider de física de la luna: una malla (trimesh) con los MISMOS cráteres
 * que la versión visual, pero a menor resolución (más barata para la física).
 * Gracias a esto el rover siente el relieve: se mete en los cráteres y brinca
 * en los bordes, en vez de flotar sobre una esfera lisa.
 */
export default function MoonCollider() {
  const args = useMemo(() => {
    // detalle 96: en la luna 3× los triángulos del collider acompañan los cráteres
    // de la malla visual (detalle 144) para que el rover no los traspase. Sin micro.
    const g = buildMoonGeometry(96, false)
    const vertices = g.attributes.position.array as Float32Array
    const count = g.attributes.position.count
    // IcosahedronGeometry es no-indexada → cada terna de vértices es un triángulo
    const indices = new Uint32Array(count)
    for (let i = 0; i < count; i++) indices[i] = i
    return [vertices, indices] as [Float32Array, Uint32Array]
  }, [])

  return <TrimeshCollider args={args} />
}
