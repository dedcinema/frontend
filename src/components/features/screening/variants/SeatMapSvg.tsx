'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Seat } from '@/types/api'
import type { SeatMapProps } from '../types'

const SEAT_SPACING = 24      // px between adjacent seat centres (all rows, flat)
const ROW_STEP = 46          // vertical distance between rows
const ARC_DEPTH = 28         // px that edge seats dip below the row's centre seat
const SEAT_W = 16
const SEAT_H = 14
const BACK_W = 12
const BACK_H = 4
const SEAT_GAP = SEAT_SPACING - SEAT_W   // = 8
const SCREEN_GAP = 44
const PAD = 28
const LEGEND_H = 52

function bodyW(m: number) { return m * SEAT_SPACING - SEAT_GAP }
function backW(m: number)  { return bodyW(m) - (SEAT_W - BACK_W) }

// Vertical dip for a seat at horizontal position x on an arc with radius r.
// Centre seat (x=0) sits at the row base; edge seats dip by arcOff(x) below it.
function arcOff(x: number, r: number): number {
  const sq = r * r - x * x
  return sq > 0 ? r - Math.sqrt(sq) : 0
}

function groupByRow(seats: Seat[]): Map<number, Seat[]> {
  const map = new Map<number, Seat[]>()
  for (const seat of seats) {
    const row = map.get(seat.row) ?? []
    row.push(seat)
    map.set(seat.row, row)
  }
  return map
}

interface SeatPos { x: number; y: number; m: number }

interface LayoutResult {
  positions: Map<string, SeatPos>
  rowLabelPos: Map<number, SeatPos>
  arcRadius: number
  screenTopY: number
  screenBottomY: number
  screenLeft: number
  screenRight: number
  vb: { x: number; y: number; w: number; h: number }
  legendY: number
  legendCX: number
}

// Every row uses the SAME x-grid and the SAME arc formula → rows are identical copies
// shifted downward by ROW_STEP. Multi-seat rows get a proportionally wider seat rect.
function buildLayout(
  rowMap: Map<number, Seat[]>,
  sortedRows: number[],
): LayoutResult | null {
  if (sortedRows.length === 0) return null

  const minRow = sortedRows[0]
  const maxSeatCount = Math.max(
    ...sortedRows.map((r) => (rowMap.get(r) ?? []).length),
    1,
  )

  // Arc radius so that the outermost seat dips exactly ARC_DEPTH below centre
  const halfSpan = ((maxSeatCount - 1) / 2) * SEAT_SPACING
  // r = halfSpan² / (2 * ARC_DEPTH), clamped so that |x| < r always holds
  const arcRadius = halfSpan > 0
    ? Math.max(halfSpan * halfSpan / (2 * ARC_DEPTH), halfSpan * 1.5)
    : 1e6

  const positions = new Map<string, SeatPos>()
  const rowLabelPos = new Map<number, SeatPos>()
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

  for (const rowNum of sortedRows) {
    const rowSeats = (rowMap.get(rowNum) ?? []).sort((a, b) => a.number - b.number)
    const n = rowSeats.length
    if (n === 0) continue

    const m = Math.max(1, Math.min(3, Math.round(maxSeatCount / n)))
    const rowBaseY = (rowNum - minRow) * ROW_STEP
    const bw = bodyW(m)

    rowSeats.forEach((seat, i) => {
      // Slot centre in the shared maxSeatCount-wide angular grid
      const slotCenter = -(maxSeatCount - 1) / 2 + i * m + (m - 1) / 2
      const x = slotCenter * SEAT_SPACING
      const y = rowBaseY - arcOff(x, arcRadius)   // edges curve toward screen, centre sits back
      const pos: SeatPos = { x, y, m }
      positions.set(seat.id, pos)

      minX = Math.min(minX, x - bw / 2)
      maxX = Math.max(maxX, x + bw / 2)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    })

    const fp = positions.get(rowSeats[0].id)
    if (fp) rowLabelPos.set(rowNum, fp)
  }

  const seatsTopY = minY - SEAT_H / 2
  const screenBottomY = seatsTopY - SCREEN_GAP
  const screenTopY = screenBottomY - 18

  const vbX = minX - PAD
  const vbY = screenTopY - PAD
  const vbW = maxX - minX + 2 * PAD
  const legendY = maxY + SEAT_H / 2 + BACK_H + 28
  const vbH = legendY + LEGEND_H - vbY
  const legendCX = (minX + maxX) / 2

  return {
    positions, rowLabelPos, arcRadius,
    screenTopY, screenBottomY,
    screenLeft: minX + 4,
    screenRight: maxX - 4,
    vb: { x: vbX, y: vbY, w: vbW, h: vbH },
    legendY, legendCX,
  }
}

function SeatShape({ x, y, m, bodyClass, backClass }: {
  x: number; y: number; m: number; bodyClass: string; backClass: string
}) {
  const bw = bodyW(m)
  const bkw = backW(m)
  return (
    <>
      <rect x={x - bw / 2}  y={y - SEAT_H / 2}           width={bw}  height={SEAT_H} rx={3} className={bodyClass} />
      <rect x={x - bkw / 2} y={y + SEAT_H / 2}           width={bkw} height={BACK_H} rx={2} className={backClass} />
    </>
  )
}

const LEGEND_ITEMS = [
  { dx: -120, m: 1, body: 'fill-zinc-600',    back: 'fill-zinc-500',    gClass: '',           label: 'Вільне'  },
  { dx:     0, m: 1, body: 'fill-emerald-500', back: 'fill-emerald-400', gClass: '',           label: 'Вибране' },
  { dx:   120, m: 1, body: 'fill-rose-900',   back: 'fill-rose-700',   gClass: 'opacity-60', label: 'Зайняте' },
]

export function SeatMapSvg({ seats, selectedSeats, onSeatClick }: SeatMapProps) {
  const rowMap = useMemo(() => groupByRow(seats), [seats])
  const sortedRows = useMemo(
    () => Array.from(rowMap.keys()).sort((a, b) => a - b),
    [rowMap],
  )
  const layout = useMemo(() => buildLayout(rowMap, sortedRows), [rowMap, sortedRows])

  if (!layout) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Немає даних про зал
      </div>
    )
  }

  const { positions, rowLabelPos, screenTopY, screenBottomY, screenLeft, screenRight, vb, legendY, legendCX } = layout
  const midX = (screenLeft + screenRight) / 2

  const screenPath = [
    `M ${screenLeft - 6} ${screenTopY}`,
    `L ${screenRight + 6} ${screenTopY}`,
    `L ${screenRight} ${screenBottomY}`,
    `Q ${midX} ${screenBottomY - 11} ${screenLeft} ${screenBottomY}`,
    'Z',
  ].join(' ')

  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full"
      style={{ maxHeight: '70vh' }}
      role="img"
      aria-label="Схема розміщення місць у залі"
    >
      <defs>
        <linearGradient id="smsvg-sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.38" />
          <stop offset="100%" stopColor="white" stopOpacity="0.05" />
        </linearGradient>
        <filter id="smsvg-glow" x="-25%" y="-50%" width="150%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Screen */}
      <g filter="url(#smsvg-glow)">
        <path d={screenPath} fill="url(#smsvg-sg)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
        <text
          x={midX}
          y={(screenTopY + screenBottomY) / 2 + 3.5}
          textAnchor="middle"
          fontSize="9"
          letterSpacing="3"
          fontWeight="600"
          fill="rgba(255,255,255,0.5)"
          style={{ userSelect: 'none' }}
        >
          ЕКРАН
        </text>
      </g>

      {/* Rows */}
      {sortedRows.map((rowNum) => {
        const rowSeats = (rowMap.get(rowNum) ?? []).sort((a, b) => a.number - b.number)
        const labelPos = rowLabelPos.get(rowNum)

        return (
          <g key={rowNum}>
            {labelPos && (
              <text
                x={labelPos.x - bodyW(labelPos.m) / 2 - 6}
                y={labelPos.y + 3.5}
                textAnchor="end"
                fontSize="9"
                fill="rgba(255,255,255,0.22)"
                style={{ userSelect: 'none' }}
              >
                {rowNum}
              </text>
            )}

            {rowSeats.map((seat) => {
              const pos = positions.get(seat.id)
              if (!pos) return null

              const { x, y, m } = pos
              const reserved = seat.status === 'reserved'
              const selected = selectedSeats.some((s) => s.id === seat.id)

              const bodyClass = cn(
                reserved             && 'fill-rose-900',
                !reserved && !selected && 'fill-zinc-600',
                selected             && 'fill-emerald-500',
              )
              const backClass = cn(
                reserved             && 'fill-rose-700',
                !reserved && !selected && 'fill-zinc-500',
                selected             && 'fill-emerald-400',
              )

              return (
                <g
                  key={seat.id}
                  onClick={reserved ? undefined : () => onSeatClick(seat)}
                  className={cn(
                    reserved  && 'opacity-50 pointer-events-none',
                    !reserved && 'cursor-pointer hover:opacity-80 transition-opacity',
                  )}
                >
                  <title>
                    {reserved
                      ? `Ряд ${seat.row}, місце ${seat.number} — зайнято`
                      : `Ряд ${seat.row}, місце ${seat.number} — ${seat.price} грн`}
                  </title>
                  <SeatShape x={x} y={y} m={m} bodyClass={bodyClass} backClass={backClass} />
                  <text
                    x={x}
                    y={y + 3.5}
                    textAnchor="middle"
                    fontSize="7"
                    fill={selected ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.55)'}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {seat.number}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Legend */}
      {LEGEND_ITEMS.map(({ dx, m, body, back, gClass, label }) => (
        <g key={label} transform={`translate(${legendCX + dx}, ${legendY})`} className={gClass}>
          <SeatShape x={0} y={0} m={m} bodyClass={body} backClass={back} />
          <text x={SEAT_W / 2 + 6} y={3.5} fontSize="10" fill="rgba(255,255,255,0.4)" style={{ userSelect: 'none' }}>
            {label}
          </text>
        </g>
      ))}
    </svg>
  )
}
