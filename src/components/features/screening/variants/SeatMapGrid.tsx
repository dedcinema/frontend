'use client'

import { cn } from '@/lib/utils'
import type { Seat } from '@/types/api'
import type { SeatMapProps } from '../types'

function groupByRow(seats: Seat[]): Map<number, Seat[]> {
  const map = new Map<number, Seat[]>()
  for (const seat of seats) {
    const row = map.get(seat.row) ?? []
    row.push(seat)
    map.set(seat.row, row)
  }
  return map
}

function isSelected(seat: Seat, selectedSeats: Seat[]) {
  return selectedSeats.some((s) => s.id === seat.id)
}

interface SeatButtonProps {
  seat: Seat
  selected: boolean
  onClick: () => void
  colStart: number
  span: number
}

function SeatButton({ seat, selected, onClick, colStart, span }: SeatButtonProps) {
  const reserved = seat.status === 'reserved'
  const tooltip = reserved
    ? `Ряд ${seat.row}, місце ${seat.number} — зайнято`
    : `Ряд ${seat.row}, місце ${seat.number} — ${seat.price} грн`

  return (
    <button
      disabled={reserved}
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
      style={{ gridColumn: `${colStart} / span ${span}` }}
      className={cn(
        'group/seat flex w-full flex-col items-stretch gap-[2px] transition-transform',
        !reserved && 'hover:-translate-y-px active:translate-y-0',
        reserved && 'cursor-not-allowed opacity-50',
      )}
    >
      {/* Seat cushion */}
      <div
        className={cn(
          'w-full rounded-md transition-colors',
          span === 1 ? 'aspect-square' : 'h-8',
          reserved && 'bg-rose-900',
          !reserved && !selected && 'bg-zinc-600 group-hover/seat:bg-zinc-400',
          selected && 'bg-emerald-500 ring-2 ring-emerald-400 ring-offset-1 ring-offset-background',
        )}
      />
      {/* Backrest — at the back (bottom, away from screen) */}
      <div
        className={cn(
          'mx-auto h-[3px] w-[70%] rounded-b-[3px] transition-colors',
          reserved && 'bg-rose-700',
          !reserved && !selected && 'bg-zinc-500 group-hover/seat:bg-zinc-300',
          selected && 'bg-emerald-400/80',
        )}
      />
    </button>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex flex-col items-center gap-[2px]">
        <span className={cn('h-[3px] w-[70%] rounded-t-[3px]', color, 'opacity-70')} />
        <span className={cn('h-3 w-4 rounded-sm', color)} />
      </span>
      {label}
    </span>
  )
}

export function SeatMapGrid({ seats, selectedSeats, onSeatClick }: SeatMapProps) {
  const rowMap = groupByRow(seats)
  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b)

  // Max seats per row by count — determines the grid column count and seat multipliers
  const maxSeatCount = Math.max(...Array.from(rowMap.values()).map((r) => r.length), 1)

  return (
    <div className="flex flex-col gap-6">
      {/* Screen */}
      <div className="flex flex-col items-center gap-1">
        <div className="h-1 w-3/4 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm" />
        <div className="w-3/4 rounded-sm bg-gradient-to-b from-white/20 to-transparent py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 shadow-[0_2px_20px_rgba(255,255,255,0.12)]">
          Екран
        </div>
        <div className="h-px w-2/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {sortedRows.map((rowNum) => {
          const rowSeats = (rowMap.get(rowNum) ?? []).sort((a, b) => a.number - b.number)
          const n = rowSeats.length
          if (n === 0) return null

          // Seat multiplier: how many base columns this row's seats occupy each
          const m = Math.max(1, Math.min(3, Math.round(maxSeatCount / n)))

          return (
            <div key={rowNum} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground/60">
                {rowNum}
              </span>

              <div
                className="grid flex-1 gap-x-1 gap-y-0"
                style={{ gridTemplateColumns: `repeat(${maxSeatCount}, minmax(0, 1fr))` }}
              >
                {rowSeats.map((seat, i) => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    selected={isSelected(seat, selectedSeats)}
                    onClick={() => onSeatClick(seat)}
                    colStart={1 + i * m}
                    span={m}
                  />
                ))}
              </div>

              <span className="w-4 shrink-0 text-left text-[10px] tabular-nums text-muted-foreground/60">
                {rowNum}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6">
        <LegendItem color="bg-zinc-600" label="Вільне" />
        <LegendItem color="bg-emerald-500" label="Вибране" />
        <LegendItem color="bg-rose-900" label="Зайняте" />
      </div>
    </div>
  )
}
