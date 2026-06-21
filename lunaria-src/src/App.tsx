import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  N8AO,
  GodRays,
  LensFlare,
} from '@react-three/postprocessing'
import { Physics, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import Moon from './Moon'
import MoonCollider from './MoonCollider'
import Planet from './Planet'
import Sun from './Sun'
import SunLight from './SunLight'
import Rover from './Rover'
import Debris from './Debris'
import SphericalGravity from './SphericalGravity'
import FollowCamera from './FollowCamera'
import Galaxy from './Galaxy'
import Dust from './Dust'
import Rayo from './Rayo'
import { setAxis, triggerJump } from './input'
import { settings } from './settings'
import { BODIES, PLANET, SUN } from './bodies'
import { travel, startTravel } from './travel'

export default function App() {
  const sunRef = useRef<THREE.Mesh>(null!)

  return (
    <div className="app">
      <Canvas
        // DPR clampeado: clave para que vaya fluido en móvil
        dpr={[1, 1.5]}
        camera={{ position: [0, 6.3, 17], fov: 45, far: 2000 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#05060d']} />
        <fog attach="fog" args={['#05060d', 24, 60]} />

        {/* Cielo estrellado + Vía Láctea (partículas) */}
        <Galaxy />

        {/* Sol lejano (visual) + el rayo de viaje (ambos fuera de Physics) */}
        <Sun ref={sunRef} />
        <Rayo />

        {/* Luz clave = el sol + relleno omnidireccional para que NO haya lado
            oscuro: el ambiente + la hemisférica iluminan suave toda la superficie */}
        <SunLight />
        <directionalLight position={[-4, -1, -3]} intensity={0.7} color="#5566b8" />
        <hemisphereLight args={['#9fb0d8', '#33384a', 0.75]} />
        <ambientLight intensity={0.85} color="#4a527e" />

        <Suspense fallback={null}>
          <Physics gravity={[0, 0, 0]}>
            {/* La gravedad multi-cuerpo tira hacia el cuerpo dominante */}
            <SphericalGravity />

            {/* Luna: cuerpo estático con collider de malla (cráteres físicos) */}
            <RigidBody type="fixed" colliders={false} friction={1}>
              <Moon />
              <MoonCollider />
            </RigidBody>

            {/* Tierra (visual + BallCollider para aterrizar/caminar) */}
            <Planet />
            {/* El Sol NO tiene collider: no se puede aterrizar/viajar a él */}

            <Rover />

            {/* rocas en la LUNA: muchas, pequeñas, de tamaños variados (instanced) */}
            <Debris count={150} seed={1337} minScale={0.005} maxScale={0.022} tint="#9aa0b4" />
            <Debris count={55} seed={9001} minScale={0.02} maxScale={0.05} tint="#878da3" />
            <Debris count={16} seed={4242} minScale={0.05} maxScale={0.1} tint="#aeb4c6" />

            {/* rocas en la TIERRA: pequeñas → algunas medianas (instanced) */}
            {(() => {
              const c: [number, number, number] = [PLANET.center.x, PLANET.center.y, PLANET.center.z]
              return (
                <>
                  <Debris count={110} seed={7777} minScale={0.025} maxScale={0.11} center={c} radius={PLANET.radius} tint="#8a8276" />
                  <Debris count={45} seed={5151} minScale={0.1} maxScale={0.28} center={c} radius={PLANET.radius} tint="#9a8f7e" />
                  <Debris count={12} seed={2024} minScale={0.28} maxScale={0.5} center={c} radius={PLANET.radius} tint="#736a5c" />
                </>
              )
            })()}

            {/* Polvo lunar (solo en contacto; usa el raycast de Rapier) */}
            <Dust />

            {/* Cámara: orbital al caminar, detrás del rayo al viajar */}
            <FollowCamera />
          </Physics>
        </Suspense>

        {/* Post-proceso: AO + brillo + god rays + lens flare (refracción) */}
        <EffectComposer>
          <N8AO aoRadius={0.7} intensity={3.5} distanceFalloff={1} color="#06070f" halfRes />
          <Bloom intensity={0.55} luminanceThreshold={0.72} luminanceSmoothing={0.28} mipmapBlur />
          {/* God rays: la luna SÍ ocluye la fuente; bajamos weight/exposure/clampMax
              para que los rayos sean un acento en el cielo y no laven la superficie. */}
          <GodRays
            sun={sunRef}
            samples={30}
            density={0.88}
            decay={0.92}
            weight={0.22}
            exposure={0.28}
            clampMax={0.55}
            blur
            resolutionScale={0.5}
          />
          <LensFlare
            lensPosition={SUN.center}
            glareSize={0.16}
            starPoints={6}
            flareSize={0.012}
            haloScale={0.55}
            colorGain={new THREE.Color(6, 4, 2)}
            secondaryGhosts
            aditionalStreaks
            starBurst={false}
            opacity={0.6}
            smoothTime={0.08}
          />
          <Noise opacity={0.05} />
          <Vignette offset={0.25} darkness={0.7} />
        </EffectComposer>
      </Canvas>

      {/* Volver al sitio de NOCTURA */}
      <a className="back-noctura" href="/" aria-label="Volver a NOCTURA">
        <span className="bn-arrow" aria-hidden="true">←</span>
        <span className="bn-label">NOCTURA</span>
      </a>

      <div className="hint">
        WASD / flechas: mover · arrastra: rotar cámara · Shift: correr · Espacio: saltar
      </div>

      {/* Control de gravedad */}
      <GravityControl />

      {/* Tablero de viaje (elegir destino) */}
      <TravelBoard />

      {/* D-pad táctil (móvil) */}
      <Dpad />

      {/* Botón de salto (móvil) */}
      <button
        className="jump-btn"
        onPointerDown={(e) => {
          e.preventDefault()
          triggerJump()
        }}
        aria-label="saltar"
      >
        SALTAR
      </button>
    </div>
  )
}

function GravityControl() {
  const [g, setG] = useState(settings.gravity)
  return (
    <div className="panel">
      <label className="panel-row">
        <span>Gravedad</span>
        <strong>{g.toFixed(1)}</strong>
      </label>
      <input
        type="range"
        min={0}
        max={40}
        step={0.5}
        value={g}
        onChange={(e) => {
          const val = parseFloat(e.target.value)
          settings.gravity = val
          setG(val)
        }}
      />
      <div className="panel-hint">baja = flota y orbita · alta = pegada</div>
    </div>
  )
}

function TravelBoard() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 150)
    return () => clearInterval(id)
  }, [])

  const warping = travel.mode !== 'walk'
  return (
    <div className="travel">
      <div className="travel-title">Viajar</div>
      {warping ? (
        <div className="travel-warp">⚡ Viajando…</div>
      ) : (
        BODIES.filter((b) => b.travelable).map((b) => {
          const here = b.id === travel.from
          return (
            <button
              key={b.id}
              className={'travel-btn' + (here ? ' here' : '')}
              disabled={here}
              onClick={() => startTravel(b.id)}
            >
              <span>{b.label}</span>
              <span className="tag">{here ? 'aquí' : 'ir →'}</span>
            </button>
          )
        })
      )}
    </div>
  )
}

function Dpad() {
  const press = (axis: 'forward' | 'right', value: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      setAxis(axis, value)
    },
    onPointerUp: () => setAxis(axis, 0),
    onPointerLeave: () => setAxis(axis, 0),
    onPointerCancel: () => setAxis(axis, 0),
  })

  return (
    <div className="dpad">
      <button className="dbtn up" {...press('forward', 1)} aria-label="adelante">▲</button>
      <button className="dbtn left" {...press('right', -1)} aria-label="izquierda">◀</button>
      <button className="dbtn right" {...press('right', 1)} aria-label="derecha">▶</button>
      <button className="dbtn down" {...press('forward', -1)} aria-label="atrás">▼</button>
    </div>
  )
}
