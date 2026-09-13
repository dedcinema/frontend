'use client'

import { useEffect, useState } from 'react'

interface SeatEngineModule {
  default: (options: { module_or_path: string }) => Promise<unknown>
  compute_positions: (json: string) => string
}

interface SeatInput {
  id: string
  row: number
  number: number
}

interface SeatPosition {
  id: string
  x: number
  y: number
  z: number
  row: number
  number: number
}

const TEST_SEATS: SeatInput[] = [
  { id: 'seat-1', row: 1, number: 1 },
  { id: 'seat-2', row: 1, number: 2 },
  { id: 'seat-3', row: 1, number: 3 },
  { id: 'seat-4', row: 1, number: 4 },
  { id: 'seat-5', row: 2, number: 1 },
  { id: 'seat-6', row: 2, number: 2 },
  { id: 'seat-7', row: 2, number: 3 },
  { id: 'seat-8', row: 2, number: 4 },
  { id: 'seat-9', row: 3, number: 1 },
  { id: 'seat-10', row: 3, number: 2 },
  { id: 'seat-11', row: 3, number: 3 },
]

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; positions: SeatPosition[]; elapsed: number }
  | { status: 'error'; message: string }

export default function WasmTestPage() {
  const [state, setState] = useState<State>({ status: 'idle' })

  useEffect(() => {
    setState({ status: 'loading' })
    const t0 = performance.now()

    ;(async () => {
      try {
        // Load seat_engine.js directly from public/ at runtime — bypasses bundler
        const mod = (await import(
          /* webpackIgnore: true */
          /* turbopackIgnore: true */
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore — runtime-only public/ ESM, not in TS module graph
          '/wasm/seat-engine/seat_engine.js'
        )) as SeatEngineModule

        // Explicit WASM URL — overrides import.meta.url resolution inside the module
        await mod.default({ module_or_path: '/wasm/seat-engine/seat_engine_bg.wasm' })

        const json = mod.compute_positions(JSON.stringify(TEST_SEATS))
        const positions = JSON.parse(json) as SeatPosition[]
        const elapsed = Math.round(performance.now() - t0)

        setState({ status: 'success', positions, elapsed })
      } catch (err) {
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      }
    })()
  }, [])

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <h1 className="mb-1 text-2xl font-bold">WASM Seat Engine</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Тест{' '}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">compute_positions()</code> —
        перетворення місць у 3D-координати залу
      </p>

      {/* Input */}
      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Input — {TEST_SEATS.length} місць
        </h2>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-xs leading-relaxed">
          {JSON.stringify(TEST_SEATS, null, 2)}
        </pre>
      </section>

      {/* Status */}
      {state.status === 'loading' && (
        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Ініціалізація WASM…
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <p className="mb-1 text-sm font-semibold text-destructive">Помилка</p>
          <pre className="whitespace-pre-wrap text-xs text-destructive/80">{state.message}</pre>
        </div>
      )}

      {state.status === 'success' && (
        <>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              WASM ініціалізовано
            </span>
            <span className="text-xs text-muted-foreground">за {state.elapsed} мс</span>
          </div>

          {/* Output JSON */}
          <section className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Output — {state.positions.length} позицій
            </h2>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-xs leading-relaxed">
              {JSON.stringify(state.positions, null, 2)}
            </pre>
          </section>

          {/* Top-down XZ projection */}
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Вид зверху (проекція X·Z)
            </h2>
            <TopDownView positions={state.positions} />
            <p className="mt-1 text-center text-[10px] text-muted-foreground">
              x — горизонталь · z — глибина · дугова геометрія залу
            </p>
          </section>
        </>
      )}
    </div>
  )
}

function TopDownView({ positions }: { positions: SeatPosition[] }) {
  if (positions.length === 0) return null

  const xs = positions.map((p) => p.x)
  const zs = positions.map((p) => p.z)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const zMin = Math.min(...zs)
  const zMax = Math.max(...zs)
  const pad = 1.5

  const toPercX = (x: number) => ((x - xMin + pad) / (xMax - xMin + pad * 2)) * 100
  const toPercZ = (z: number) => ((z - zMin + pad) / (zMax - zMin + pad * 2)) * 100

  // unique rows for row labels
  const rowColors: Record<number, string> = {
    1: 'bg-sky-500',
    2: 'bg-violet-500',
    3: 'bg-amber-500',
  }

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-lg border border-border bg-muted/40">
      {/* Screen hint at top */}
      <div className="absolute inset-x-8 top-2 h-1 rounded-full bg-white/20" />
      <span className="absolute inset-x-0 top-4 text-center text-[9px] text-muted-foreground/60">
        ЕКРАН
      </span>

      {positions.map((pos) => (
        <div
          key={pos.id}
          title={`r${pos.row}·m${pos.number}  x:${pos.x.toFixed(2)} z:${pos.z.toFixed(2)}`}
          className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm text-[8px] font-bold text-black ${rowColors[pos.row] ?? 'bg-zinc-400'}`}
          style={{ left: `${toPercX(pos.x)}%`, top: `${toPercZ(pos.z)}%` }}
        >
          {pos.number}
        </div>
      ))}
    </div>
  )
}
