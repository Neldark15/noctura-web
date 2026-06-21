/**
 * Estado de input compartido (teclado + touch).
 * Lo leen los componentes de física cada frame.
 *   forward: 1 (adelante) .. -1 (atrás)
 *   right:   1 (derecha)  .. -1 (izquierda)
 */
export const input = { forward: 0, right: 0, run: false, wave: false, jump: false }

const keys: Record<string, boolean> = {}

function recompute() {
  input.forward =
    (keys['ArrowUp'] || keys['KeyW'] ? 1 : 0) - (keys['ArrowDown'] || keys['KeyS'] ? 1 : 0)
  input.right =
    (keys['ArrowRight'] || keys['KeyD'] ? 1 : 0) - (keys['ArrowLeft'] || keys['KeyA'] ? 1 : 0)
  input.run = !!(keys['ShiftLeft'] || keys['ShiftRight'])
}

/** Para un botón de "correr". */
export function setRun(v: boolean) {
  input.run = v
}

/** Dispara el saludo (botón / control). */
export function triggerWave() {
  input.wave = true
}

/** Dispara el salto (botón / control). */
export function triggerJump() {
  input.jump = true
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    // salto: solo en el flanco (no auto-repetir mientras se mantiene Espacio)
    if (e.code === 'Space' && !keys['Space']) input.jump = true
    keys[e.code] = true
    if (e.code === 'KeyE') input.wave = true // saludar
    recompute()
  })
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false
    recompute()
  })
}

/** Para los botones touch (móvil): fija un eje directamente. */
export function setAxis(axis: 'forward' | 'right', value: number) {
  input[axis] = value
}
