import type { RapierRigidBody } from '@react-three/rapier'

/**
 * Referencia compartida al cuerpo físico del rover, para que la cámara que lo
 * sigue pueda leer su posición/velocidad sin prop drilling.
 */
export const roverRef: { current: RapierRigidBody | null } = { current: null }
