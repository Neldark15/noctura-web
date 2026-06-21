import { SUN } from './bodies'

/**
 * Luz clave = el SOL. Direccional desde la posición del sol hacia el origen, así
 * la luna, el planeta y el personaje quedan iluminados desde la dirección real
 * del sol (coherente con su brillo en el cielo).
 */
export default function SunLight() {
  return (
    <directionalLight
      position={[SUN.center.x, SUN.center.y, SUN.center.z]}
      intensity={2.6}
      color="#fff3df"
    />
  )
}
