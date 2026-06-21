import * as THREE from 'three'

/**
 * Dirección "adelante" de la cámara (tangente a la superficie), compartida entre
 * la cámara y el Rover. La cámara la calcula por TRANSPORTE PARALELO (estable, sin
 * la singularidad del "arriba global" cerca de los polos) y el Rover la usa para
 * el movimiento → mantener W avanza en línea recta sin desviarse de lado.
 */
export const view = {
  forward: new THREE.Vector3(0, 0, -1),
}
