import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, extend, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import {
  CuboidCollider,
  Physics,
  RigidBody,
  interactionGroups,
  useBeforePhysicsStep,
  useRopeJoint,
  type RapierRigidBody,
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import {
  CARD_ANCHOR,
  CARD_H,
  CLASP,
  CARD_W,
  LIGHT,
  RAIL_INSET,
  REACH,
  SLOT,
  STRAP_W,
  WALL_Z,
  drawFront,
  drawStrap,
  loadCardAssets,
} from '../lib/cardArt'
import { drawBack } from '../lib/cardBack'

extend({ MeshLineGeometry, MeshLineMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    // meshline ships no R3F element types
    meshLineGeometry: any
    meshLineMaterial: any
  }
}

type Props = {
  flipped: boolean
  onFlip: () => void
  /** called once the rig is mounted with its final textures, so the poster can hand over */
  onReady: () => void
  sub: string
  location: string
  /** horizontal anchor of the strap, 0..1 across the canvas */
  anchorX: number
  /** pixels per world unit, sets how big the card renders */
  ppu: number
  /** dark theme: the wall is lit by a spotlight, so its shadow is drawn deeper */
  dark: boolean
  active: boolean
}

const MAX_THROW = 16 // world units / s
// Nothing in the scene needs contacts.
const NO_CONTACTS = interactionGroups(0, [])
// How meshline's lineWidth maps onto world units (measured: lineWidth 1 ≈ 0.19 units).
const LINE_WIDTH = STRAP_W / 0.19
// The strap texture is a 16:1 tile; this keeps the printed text at its true proportions.
const STRAP_TILE = STRAP_W * 16
const RIBBON_POINTS = 32

/** Rounded-rectangle outline in world units, with the clip slot as a hole. */
function cardShape() {
  const w = CARD_W
  const h = CARD_H
  const r = (18 / 300) * w
  const s = new THREE.Shape()
  s.moveTo(-w / 2 + r, -h / 2)
  s.lineTo(w / 2 - r, -h / 2)
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  s.lineTo(w / 2, h / 2 - r)
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  s.lineTo(-w / 2 + r, h / 2)
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  s.lineTo(-w / 2, -h / 2 + r)
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
  const px = w / 1024
  const sw = SLOT.w * px
  const sh = SLOT.h * px
  const top = h / 2 - SLOT.top * px
  const hole = new THREE.Path()
  hole.absarc(-sw / 2 + sh / 2, top - sh / 2, sh / 2, Math.PI / 2, (Math.PI * 3) / 2, false)
  hole.lineTo(sw / 2 - sh / 2, top - sh)
  hole.absarc(sw / 2 - sh / 2, top - sh / 2, sh / 2, -Math.PI / 2, Math.PI / 2, false)
  hole.lineTo(-sw / 2 + sh / 2, top)
  s.holes.push(hole)
  return s
}

/**
 * meshline decides an end vertex's direction with a float `==` against its own copy, which fails on
 * rounding and splays the strap's ends into a chevron. A lead-in and lead-out a hair beyond each end
 * give the real ends a proper neighbour, and capWidth gives those two tips zero width so their own
 * random direction draws nothing.
 */
function endCaps(pts: THREE.Vector3[]) {
  const n = pts.length
  pts[0].subVectors(pts[1], pts[2]).setLength(0.002).add(pts[1])
  pts[n - 1].subVectors(pts[n - 2], pts[n - 3]).setLength(0.002).add(pts[n - 2])
}

const capWidth = (t: number) => (t === 0 || t === 1 ? 0 : 1)

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/**
 * The strap as a smooth curve from the rail to the clip, like a fabric ribbon: it leaves the rail
 * pointing down, arrives along the card's own up axis, and bows sideways when the card is pushed
 * closer than the strap's length. Being drawn, not simulated, it cannot kink or jitter.
 */
function ribbon(out: THREE.Vector3[], p0: THREE.Vector3, p1: THREE.Vector3, up: THREE.Vector3, bowSign: number) {
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const dz = p1.z - p0.z
  const c = Math.max(1e-4, Math.hypot(dx, dy, dz))
  // tangent at the rail: halfway between straight down and the chord (straight down if they cancel out)
  let t0x = (dx / c) * 0.5
  let t0y = (dy / c) * 0.5 - 0.5
  const t0l = Math.hypot(t0x, t0y)
  if (t0l < 0.1) {
    t0x = 0
    t0y = -c
  } else {
    t0x = (t0x / t0l) * c
    t0y = (t0y / t0l) * c
  }
  // tangent at the clip: travelling down the card's up axis
  const t1x = -up.x * c
  const t1y = -up.y * c
  const t1z = -up.z * c
  // slack: two halves of the strap form a triangle over the chord, drooping downward like fabric
  const bow = Math.sqrt(Math.max(0, REACH * REACH - c * c)) / 2
  let nx = -dy / c
  let ny = dx / c
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }
  // a near-vertical chord has no "down" side; bowSign keeps it on one side instead of flickering
  if (ny > -0.2) nx = Math.abs(nx) * bowSign
  for (let i = 0; i < out.length; i++) {
    const t = i / (out.length - 1)
    const t2 = t * t
    const t3 = t2 * t
    const h00 = 2 * t3 - 3 * t2 + 1
    const h10 = t3 - 2 * t2 + t
    const h01 = -2 * t3 + 3 * t2
    const h11 = t3 - t2
    const b = Math.sin(Math.PI * t) * bow
    out[i].set(
      h00 * p0.x + h10 * t0x + h01 * p1.x + h11 * t1x + nx * b,
      h00 * p0.y + h10 * t0y + h01 * p1.y + h11 * t1y + ny * b,
      h00 * p0.z + h01 * p1.z + h11 * t1z,
    )
  }
}

function Band({ flipped, onFlip, onReady, sub, location, anchorX, ppu }: Omit<Props, 'active' | 'dark'>) {
  const band = useRef<THREE.Mesh>(null!)
  const fixed = useRef<RapierRigidBody>(null!)
  const card = useRef<RapierRigidBody>(null!)
  const clip = useRef<THREE.Object3D>(null!)
  const flipGroup = useRef<THREE.Group>(null!)

  const three = useThree()
  const { size, gl } = three
  // derived from ppu rather than `viewport`, which lags behind the camera rig
  const ax = (anchorX - 0.5) * (size.width / ppu)
  const ay = size.height / ppu / 2 - RAIL_INSET

  // Created at rest, exactly where the poster drew the card, so the handover is invisible.
  // Later layout changes teleport the rig instead of remounting it.
  const [start] = useState(() => ({
    fixed: [ax, ay, 0] as [number, number, number],
    card: [ax, ay - REACH - CARD_ANCHOR, 0] as [number, number, number],
  }))
  const placed = useRef({ x: ax, y: ay })
  useEffect(() => {
    const dx = ax - placed.current.x
    const dy = ay - placed.current.y
    if (!dx && !dy) return
    placed.current = { x: ax, y: ay }
    for (const b of [fixed.current, card.current]) {
      if (!b) continue
      const t = b.translation()
      b.setTranslation({ x: t.x + dx, y: t.y + dy, z: t.z }, true)
    }
  }, [ax, ay])

  const [dragged, setDragged] = useState<THREE.Vector3 | false>(false)
  const dragging = useRef(false)
  const [hovered, hover] = useState(false)
  const lastDown = useRef(0)

  // scratch objects, reused every frame
  const tmp = useMemo(() => {
    const scratch = {
      ray: new THREE.Vector3(),
      target: new THREE.Vector3(),
      prev: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      anchor: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      rail: new THREE.Vector3(),
      clipPos: new THREE.Vector3(),
      clipQuat: new THREE.Quaternion(),
      up: new THREE.Vector3(),
      // two extra points: a tiny lead-in and lead-out, see endCaps()
      pts: Array.from({ length: RIBBON_POINTS + 2 }, () => new THREE.Vector3()),
      bowSign: 1,
      hasPrev: false,
      throwVel: null as THREE.Vector3 | null,
      idle: 0,
      t: 0,
    }
    // the ribbon proper, without the end caps: same Vector3 objects, so ribbon() fills pts in place
    return { ...scratch, core: scratch.pts.slice(1, -1) }
  }, [])

  // undefined until the photo and fonts are in; null if the photo failed
  const [photo, setPhoto] = useState<HTMLImageElement | null>()
  useEffect(() => void loadCardAssets().then(setPhoto), [])
  const ready = photo !== undefined
  const front = useMemo(() => toTexture(drawFront(photo ?? null, sub, location)), [photo, sub, location])
  const back = useMemo(() => toTexture(drawBack()), [ready])
  const strap = useMemo(() => {
    const t = toTexture(drawStrap())
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  }, [ready])
  useEffect(() => {
    if (ready) onReady()
  }, [ready])
  const shape = useMemo(() => cardShape(), [])
  useEffect(() => () => void [front, back, strap].forEach((t) => t.dispose()), [front, back, strap])

  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  if (import.meta.env.DEV) (window as any).__lanyard = { fixed, card, clip, tmp, band, three }

  // One rope from the rail to the clip ring: taut it swings the card, pushed closer it goes slack.
  useRopeJoint(fixed, card, [[0, 0, 0], [0, CARD_ANCHOR, 0], REACH])

  useEffect(() => {
    if (!hovered && !dragged) return
    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => void (document.body.style.cursor = 'auto')
  }, [hovered, dragged])

  const endDrag = () => {
    if (!dragging.current) return
    dragging.current = false
    // hand the pointer's velocity to the card so it gets tossed, capped so it can't fling off screen
    tmp.throwVel = tmp.vel.clone().clampLength(0, MAX_THROW)
    tmp.hasPrev = false
    setDragged(false)
  }

  // A pointer released outside the canvas (or a cancelled touch) must still end the drag.
  useEffect(() => {
    if (!dragged) return
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    window.addEventListener('blur', endDrag)
    return () => {
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      window.removeEventListener('blur', endDrag)
    }
  }, [dragged])

  // The canvas allows vertical page scrolling on touch screens; once a finger has grabbed the card,
  // cancelling touchmove keeps the browser from turning the drag into a scroll.
  useEffect(() => {
    const el = gl.domElement
    const block = (e: TouchEvent) => {
      if (dragging.current && e.cancelable) e.preventDefault()
    }
    el.addEventListener('touchmove', block, { passive: false })
    return () => el.removeEventListener('touchmove', block)
  }, [gl])

  // Forces run per physics step so they behave the same at 60, 120 or 144 Hz.
  useBeforePhysicsStep((world) => {
    const c = card.current
    if (!c) return
    const dt = world.timestep

    if (tmp.throwVel && c.isDynamic()) {
      c.setLinvel(tmp.throwVel, true)
      tmp.throwVel = null
    }
    if (dragging.current) {
      tmp.idle = 0
      return
    }
    tmp.idle += dt
    tmp.t += dt

    // ease the card back to facing the viewer (yaw only)
    const q = c.rotation()
    const yaw = 2 * Math.atan2(q.y, q.w)
    const w = c.angvel()
    if (Math.abs(yaw) > 0.002 || Math.abs(w.y) > 0.002) c.setAngvel({ x: w.x, y: w.y * 0.96 - yaw * 0.12, z: w.z }, false)

    // gentle idle sway, in the card's plane only, fading in after the card settles
    if (!reduce && tmp.idle > 1.2) {
      // a sideways push of ~4% of the card's weight tilts it roughly two degrees each way
      const ramp = Math.min(1, (tmp.idle - 1.2) / 2)
      const force = Math.sin(tmp.t * 1.25) * 0.04 * c.mass() * 40 * ramp
      c.applyImpulse({ x: force * dt, y: 0, z: 0 }, true)
    }
  })

  useFrame((state, delta) => {
    const c = card.current
    const f = fixed.current
    if (!c || !f) return

    if (dragging.current && dragged) {
      // pointer → point on the z = 0 plane
      const cam = state.camera
      tmp.ray.set(state.pointer.x, state.pointer.y, 0.5).unproject(cam).sub(cam.position).normalize()
      const k = -cam.position.z / tmp.ray.z
      tmp.target.copy(cam.position).addScaledVector(tmp.ray, k).sub(dragged)
      tmp.target.z = 0

      // keep the clip within reach of the taut strap (rotation-aware), so the rope never fights the drag
      const r = c.rotation()
      tmp.quat.set(r.x, r.y, r.z, r.w)
      tmp.anchor.set(0, CARD_ANCHOR, 0).applyQuaternion(tmp.quat)
      const ft = f.translation()
      const ox = tmp.target.x + tmp.anchor.x - ft.x
      const oy = tmp.target.y + tmp.anchor.y - ft.y
      const oz = tmp.target.z + tmp.anchor.z - ft.z
      const len = Math.hypot(ox, oy, oz)
      if (len > REACH) {
        const s = REACH / len
        tmp.target.set(ft.x + ox * s - tmp.anchor.x, ft.y + oy * s - tmp.anchor.y, ft.z + oz * s - tmp.anchor.z)
      }

      if (tmp.hasPrev && delta > 0) {
        const v = tmp.prev.clone().sub(tmp.target).multiplyScalar(-1 / delta)
        tmp.vel.lerp(v, 0.5)
      } else tmp.vel.set(0, 0, 0)
      tmp.prev.copy(tmp.target)
      tmp.hasPrev = true
      c.setNextKinematicTranslation(tmp.target)
    }

    // Strap ends come from what is actually drawn this frame (the interpolated card), not the raw
    // physics state, so the strap stays glued to the clip however fast the card moves.
    tmp.rail.set(ax, ay, 0)
    clip.current.updateWorldMatrix(true, false)
    clip.current.getWorldPosition(tmp.clipPos)
    clip.current.getWorldQuaternion(tmp.clipQuat)
    tmp.up.set(0, 1, 0).applyQuaternion(tmp.clipQuat)
    // keep the bow on one side until the card clearly crosses under the rail
    const side = tmp.clipPos.x - ax
    if (Math.abs(side) > 0.05) tmp.bowSign = side > 0 ? -1 : 1
    ribbon(tmp.core, tmp.rail, tmp.clipPos, tmp.up, tmp.bowSign)
    endCaps(tmp.pts)

    let length = 0
    for (let i = 1; i < tmp.pts.length; i++) length += tmp.pts[i].distanceTo(tmp.pts[i - 1])
    const mat = band.current.material as MeshLineMaterial
    mat.repeat.set(-length / STRAP_TILE, 1)
    ;(band.current.geometry as MeshLineGeometry).setPoints(tmp.pts, capWidth)

    // flip lives on a child group so the physics body is untouched
    flipGroup.current.rotation.y = THREE.MathUtils.damp(flipGroup.current.rotation.y, flipped ? Math.PI : 0, 7, delta)
  })

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const now = performance.now()
    if (now - lastDown.current < 300) onFlip()
    lastDown.current = now
    try {
      ;(e.target as Element).setPointerCapture(e.pointerId)
    } catch {
      // synthetic or already-released pointers can't be captured; the window listeners still end the drag
    }
    const t = card.current.translation()
    dragging.current = true
    tmp.hasPrev = false
    tmp.throwVel = null
    setDragged(new THREE.Vector3(e.point.x - t.x, e.point.y - t.y, 0))
  }
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    try {
      ;(e.target as Element).releasePointerCapture(e.pointerId)
    } catch {}
    endDrag()
  }

  const depth = 0.018

  return (
    <>
      <RigidBody ref={fixed} type="fixed" colliders={false} position={start.fixed} />
      <RigidBody
        ref={card}
        type={dragged ? 'kinematicPosition' : 'dynamic'}
        colliders={false}
        canSleep
        position={start.card}
        linearDamping={1.2}
        angularDamping={2}
      >
        <CuboidCollider args={[CARD_W / 2, CARD_H / 2, 0.01]} collisionGroups={NO_CONTACTS} />
        {/* the point the strap is tied to, outside the flip group so flipping never moves it */}
        <object3D ref={clip} position={[0, CARD_ANCHOR, 0]} />
        <group
          ref={flipGroup}
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}
          onPointerDown={onDown}
          onPointerUp={onUp}
        >
          {/* the edge carries the card's rounded silhouette into the shadow */}
          <mesh position={[0, 0, -depth / 2]} castShadow>
            <extrudeGeometry args={[shape, { depth, bevelEnabled: false, curveSegments: 8 }]} />
            <meshStandardMaterial color="#0c0c0c" metalness={0.2} roughness={0.4} />
          </mesh>
          {/* Faces are unlit: the printed card keeps its exact colours, true black and white, like the poster. */}
          <mesh position={[0, 0, depth / 2 + 0.001]}>
            <planeGeometry args={[CARD_W, CARD_H]} />
            <meshBasicMaterial map={front} alphaTest={0.5} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -depth / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[CARD_W, CARD_H]} />
            <meshBasicMaterial map={back} alphaTest={0.5} toneMapped={false} />
          </mesh>
          <Clasp />
        </group>
      </RigidBody>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" toneMapped={false} resolution={[size.width, size.height]} useMap map={strap} lineWidth={LINE_WIDTH} />
      </mesh>
    </>
  )
}

const chrome = <meshStandardMaterial color="#e6e8ec" metalness={1} roughness={0.25} envMapIntensity={2.2} />

/**
 * Lanyard hardware after the reference: a clamp on the strap end, a D-ring, a swivel, and a hook that
 * runs down the card's face and curves through the punched slot to the back of the card.
 */
function Clasp() {
  const { clampY, clampH, ringY, ringR, swivelTop, swivelBottom, hookBottom, hookZ } = CLASP
  const rod = swivelBottom - hookBottom
  return (
    <group>
      <mesh position={[0, clampY, 0]} castShadow>
        <boxGeometry args={[STRAP_W + 0.02, clampH, 0.03]} />
        <meshStandardMaterial color="#2e3037" metalness={0.6} roughness={0.4} envMapIntensity={1.5} />
      </mesh>
      {/* D-ring: lower half of a torus, hanging from the clamp */}
      <mesh position={[0, ringY, 0]} rotation={[0, 0, Math.PI]} castShadow>
        <torusGeometry args={[ringR, 0.011, 10, 32, Math.PI]} />
        {chrome}
      </mesh>
      <mesh position={[0, (swivelTop + swivelBottom) / 2, hookZ / 2]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, swivelTop - swivelBottom, 16]} />
        {chrome}
      </mesh>
      {/* hook shank, in front of the card */}
      <mesh position={[0, hookBottom + rod / 2, hookZ]} castShadow>
        <cylinderGeometry args={[0.013, 0.013, rod, 12]} />
        {chrome}
      </mesh>
      {/* the bend through the slot: a half ring in the card's side plane, front to back */}
      <mesh position={[0, hookBottom, 0]} rotation={[0, Math.PI / 2, Math.PI]}>
        <torusGeometry args={[hookZ, 0.013, 10, 20, Math.PI]} />
        {chrome}
      </mesh>
      {/* the tip coming back up behind the card */}
      <mesh position={[0, hookBottom + 0.03, -hookZ]}>
        <cylinderGeometry args={[0.013, 0.013, 0.06, 12]} />
        {chrome}
      </mesh>
    </group>
  )
}

/** Soft studio reflections for the metal clip, without drei's HDR loaders. */
function RoomLight() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.45
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

/** Moves the camera so one world unit is always `ppu` pixels tall. */
function CameraRig({ ppu }: { ppu: number }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const visible = size.height / ppu
    cam.position.z = visible / 2 / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
    cam.updateProjectionMatrix()
  }, [camera, size.height, ppu])
  return null
}

export default function Lanyard(props: Props) {
  const { active, dark, ...rest } = props
  return (
    <Canvas
      camera={{ position: [0, 0, 13], fov: 25 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      flat
      shadows="variance"
      frameloop={active ? 'always' : 'never'}
      style={{ background: 'transparent' }}
    >
      <CameraRig ppu={props.ppu} />
      <ambientLight intensity={Math.PI * 0.35} />
      <directionalLight
        position={[LIGHT.x, LIGHT.y, LIGHT.z]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={9}
        shadow-blurSamples={16}
        shadow-bias={-0.0004}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      {/* the wall behind the card: invisible except for the shadow falling on it */}
      <mesh position={[0, 0, WALL_Z]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <shadowMaterial transparent opacity={dark ? 0.55 : 0.26} />
      </mesh>
      {/* runs before the scene's frame callbacks, so the strap reads this frame's card position */}
      <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60} numSolverIterations={8} updatePriority={-50}>
        <Band {...rest} />
      </Physics>
      <RoomLight />
    </Canvas>
  )
}
