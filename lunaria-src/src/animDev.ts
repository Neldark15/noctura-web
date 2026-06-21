/**
 * Control del NAVEGADOR de animaciones (debug, temporal). Como el GLB trae 17
 * clips con nombres genéricos (NlaTrack.000–016), este panel deja recorrerlos
 * uno por uno para identificar cuál es idle/caminar/correr/saludar/etc.
 *   preview = -1  → modo juego (máquina de estados normal)
 *   preview >= 0  → fuerza reproducir el clip[preview] en bucle
 */
export const animDev = { preview: -1, count: 17 }

// hook temporal para navegar los clips por eval durante el desarrollo
if (typeof window !== 'undefined') {
  ;(window as unknown as { __anim?: unknown }).__anim = animDev
}
