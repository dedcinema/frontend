'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { SeatMapProps } from '../types'
import type { Seat } from '@/types/api'

// ─── types ────────────────────────────────────────────────────────────────────

interface SeatEngineModule {
  default: (opts: { module_or_path: string }) => Promise<unknown>
  compute_positions: (json: string) => string
}

interface SeatPosition {
  id: string
  x: number
  y: number
  z: number
  row: number
  number: number
  seat_type: string
  width_factor: number
}

interface SeatMeshData {
  group: THREE.Group
  cushion: THREE.Mesh
  backrest: THREE.Mesh
  seat: Seat
  baseY: number
}

// ─── module-level singletons & helpers ───────────────────────────────────────

// Prevents double-init in React 18 Strict Mode (double useEffect in dev)
let wasmSingleton: Promise<SeatEngineModule> | null = null

function getWasm(): Promise<SeatEngineModule> {
  if (!wasmSingleton) {
    wasmSingleton = (async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — runtime-only public/ ESM, not in TS module graph
      const mod = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ '/wasm/seat-engine/seat_engine.js')) as SeatEngineModule
      await mod.default({ module_or_path: '/wasm/seat-engine/seat_engine_bg.wasm' })
      return mod
    })()
  }
  return wasmSingleton
}

// Fetches image via Next.js proxy (/api/media) → blob → THREE.Texture
// Blob URL is same-origin so WebGL accepts it without CORS restrictions
async function fetchBannerTexture(rawPath: string): Promise<THREE.Texture | null> {
  try {
    const fullUrl = rawPath.startsWith('http')
      ? rawPath
      : `${process.env.NEXT_PUBLIC_S3_URL ?? ''}${rawPath}`

    const res = await fetch(`/api/media?url=${encodeURIComponent(fullUrl)}`)
    if (!res.ok) {
      console.warn('[SeatMapWasm] banner proxy error:', res.status, fullUrl)
      return null
    }

    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)

    return new Promise<THREE.Texture | null>((resolve) => {
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(blobUrl)
        const tex = new THREE.Texture(img)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
        console.log('[SeatMapWasm] banner ready')
        resolve(tex)
      }
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl)
        console.warn('[SeatMapWasm] banner img failed')
        resolve(null)
      }
      img.src = blobUrl
    })
  } catch (err) {
    console.warn('[SeatMapWasm] banner fetch threw:', err)
    return null
  }
}

// ─── material helpers ─────────────────────────────────────────────────────────

function makeMat(seat: Seat, selected: boolean): THREE.MeshStandardMaterial {
  if (seat.status === 'reserved') {
    return new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 })
  }
  if (selected) {
    return new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: new THREE.Color(0x16a34a),
      emissiveIntensity: 0.4,
    })
  }
  return new THREE.MeshStandardMaterial({ color: 0x3f3f46 })
}

function applyMat(data: SeatMeshData, selected: boolean) {
  const mat = makeMat(data.seat, selected)
  ;(data.cushion.material as THREE.Material).dispose()
  ;(data.backrest.material as THREE.Material).dispose()
  data.cushion.material = mat
  data.backrest.material = mat.clone()
}

// ─── component ────────────────────────────────────────────────────────────────

export function SeatMapWasm({ hall: _hall, screening, seats, selectedSeats, onSeatClick }: SeatMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const selectedRef = useRef(selectedSeats)
  const clickRef = useRef(onSeatClick)
  selectedRef.current = selectedSeats
  clickRef.current = onSeatClick

  const hoveredIdRef = useRef<string | null>(null)
  const seatDataRef = useRef<Map<string, SeatMeshData>>(new Map())

  // Material sync when selection changes — no scene rebuild needed
  useEffect(() => {
    const ids = new Set(selectedSeats.map((s) => s.id))
    seatDataRef.current.forEach((data, id) => applyMat(data, ids.has(id)))
  }, [selectedSeats])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId = 0
    let disposed = false

    const cushionGeos = new Map<number, THREE.BoxGeometry>()
    const backrestGeos = new Map<number, THREE.BoxGeometry>()

    function getCushionGeo(wf: number) {
      if (!cushionGeos.has(wf)) cushionGeos.set(wf, new THREE.BoxGeometry(0.8 * wf, 0.5, 0.6))
      return cushionGeos.get(wf)!
    }
    function getBackrestGeo(wf: number) {
      if (!backrestGeos.has(wf)) backrestGeos.set(wf, new THREE.BoxGeometry(0.8 * wf, 0.6, 0.1))
      return backrestGeos.get(wf)!
    }

    const intersectables: THREE.Mesh[] = []

    // ── renderer ──────────────────────────────────────────────────────────────
    const w = container.clientWidth || 800
    const h = container.clientHeight || 480
    console.log('[SeatMapWasm] mount —', w, '×', h)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.85
    container.appendChild(renderer.domElement)
    console.log('[SeatMapWasm] canvas appended')

    // ── scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x080810)
    scene.fog = new THREE.Fog(0x080810, 28, 55)

    // ── camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
    camera.position.set(0, 13, 19)
    camera.lookAt(0, 1, 3)

    // ── controls ──────────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 3)
    controls.maxPolarAngle = Math.PI / 2 - 0.06
    controls.minDistance = 5
    controls.maxDistance = 35
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.update()

    // ── lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))

    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8)
    dirLight.position.set(4, 16, 8)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.set(1024, 1024)
    scene.add(dirLight)

    const screenPt = new THREE.PointLight(0xc8e0ff, 2, 22)
    screenPt.position.set(0, 4, -5)
    scene.add(screenPt)

    // ── floor ─────────────────────────────────────────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x0d0d18, roughness: 0.95 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    const grid = new THREE.GridHelper(40, 40, 0x1e1e30, 0x191926)
    grid.position.y = 0.004
    scene.add(grid)

    // ── screen ────────────────────────────────────────────────────────────────
    const SCREEN_Z = -7
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xd4e8ff),
      emissiveIntensity: 0.65,
      roughness: 0.25,
    })
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), screenMat)
    screenMesh.position.set(0, 4.5, SCREEN_Z)
    scene.add(screenMesh)

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(21.4, 9.4, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.3 }),
    )
    frame.position.set(0, 4.5, SCREEN_Z - 0.12)
    scene.add(frame)

    // ── raycaster ─────────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()

    function pick(e: MouseEvent): SeatMeshData | null {
      if (!intersectables.length) return null
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObjects(intersectables)
      if (!hits.length) return null
      return seatDataRef.current.get(hits[0].object.userData.seatId as string) ?? null
    }

    function onMouseMove(e: MouseEvent) {
      const data = pick(e)
      hoveredIdRef.current = data?.seat.id ?? null
      if (!data) renderer.domElement.style.cursor = 'grab'
      else if (data.seat.status === 'reserved') renderer.domElement.style.cursor = 'not-allowed'
      else renderer.domElement.style.cursor = 'pointer'
    }

    let downX = 0, downY = 0
    function onMouseDown(e: MouseEvent) { downX = e.clientX; downY = e.clientY }
    function onClick(e: MouseEvent) {
      if ((e.clientX - downX) ** 2 + (e.clientY - downY) ** 2 > 16) return
      const data = pick(e)
      if (data && data.seat.status !== 'reserved') clickRef.current(data.seat)
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('click', onClick)
    renderer.domElement.style.cursor = 'grab'

    // ── animation loop ────────────────────────────────────────────────────────
    function startLoop() {
      let frame = 0
      console.log('[SeatMapWasm] loop started')
      function animate() {
        rafId = requestAnimationFrame(animate)
        controls.update()
        seatDataRef.current.forEach((data, id) => {
          const lifted = hoveredIdRef.current === id && data.seat.status !== 'reserved'
          data.group.position.y += ((data.baseY + (lifted ? 0.3 : 0)) - data.group.position.y) * 0.12
        })
        renderer.render(scene, camera)
        if (frame++ < 3) console.log('[SeatMapWasm] render frame', frame)
      }
      animate()
    }

    // ── resize ────────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return
      const rw = containerRef.current.clientWidth
      const rh = containerRef.current.clientHeight
      camera.aspect = rw / rh
      camera.updateProjectionMatrix()
      renderer.setSize(rw, rh)
    })
    ro.observe(container)

    // ── load WASM + banner in parallel, then build scene ──────────────────────
    async function loadAndBuild() {
      try {
        const bannerPath = screening.movie?.banner ?? null

        const [mod, bannerTex] = await Promise.all([
          getWasm(),
          bannerPath ? fetchBannerTexture(bannerPath) : Promise.resolve(null),
        ])

        if (disposed) { bannerTex?.dispose(); return }

        // Apply banner (or keep white emissive fallback)
        if (bannerTex) {
          screenMat.map = bannerTex
          screenMat.emissiveIntensity = 0.12
          screenMat.needsUpdate = true
        }

        // Build seats from WASM positions
        const wasmInput = seats.map((s) => ({ id: s.id, row: s.row, number: s.number, seat_type: s.type }))
        const positions: SeatPosition[] = JSON.parse(mod.compute_positions(JSON.stringify(wasmInput)))
        const posMap = new Map(positions.map((p) => [p.id, p]))
        const selectedIds = new Set(selectedRef.current.map((s) => s.id))

        seats.forEach((seat) => {
          const pos = posMap.get(seat.id)
          if (!pos) return

          const wf = pos.width_factor
          const mat = makeMat(seat, selectedIds.has(seat.id))

          const cushion = new THREE.Mesh(getCushionGeo(wf), mat.clone())
          cushion.castShadow = true
          cushion.position.set(0, 0.25, 0)
          cushion.userData.seatId = seat.id

          const backrest = new THREE.Mesh(getBackrestGeo(wf), mat.clone())
          backrest.castShadow = true
          backrest.position.set(0, 0.78, 0.28)
          backrest.userData.seatId = seat.id

          const group = new THREE.Group()
          group.add(cushion, backrest)
          group.position.set(pos.x, pos.y, pos.z)
          scene.add(group)

          seatDataRef.current.set(seat.id, { group, cushion, backrest, seat, baseY: pos.y })
          intersectables.push(cushion, backrest)
        })

        if (!disposed) {
          console.log('[SeatMapWasm] ready, seats:', seatDataRef.current.size)
          setLoadStatus('ready')
          startLoop()
        }
      } catch (err) {
        if (!disposed) {
          setErrorMsg(err instanceof Error ? err.message : String(err))
          setLoadStatus('error')
        }
      }
    }

    loadAndBuild()

    // ── cleanup ───────────────────────────────────────────────────────────────
    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      ro.disconnect()
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('click', onClick)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      cushionGeos.forEach((g) => g.dispose())
      backrestGeos.forEach((g) => g.dispose())
      if (screenMat.map) screenMat.map.dispose()
      screenMat.dispose()
      seatDataRef.current.forEach((data) => {
        ;(data.cushion.material as THREE.Material).dispose()
        ;(data.backrest.material as THREE.Material).dispose()
      })
      seatDataRef.current.clear()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[480px] w-full overflow-hidden rounded-xl border border-border" />

      {loadStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Завантаження 3D залу…</span>
          </div>
        </div>
      )}

      {loadStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/90">
          <div className="text-center">
            <p className="mb-1 font-semibold text-destructive">Помилка завантаження</p>
            <p className="max-w-xs text-xs text-muted-foreground">{errorMsg}</p>
          </div>
        </div>
      )}

      {loadStatus === 'ready' && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/80 px-3 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
          Scroll — зум · Drag — обертання · Click — вибір місця
        </p>
      )}
    </div>
  )
}
