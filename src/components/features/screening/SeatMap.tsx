'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useSeats } from '@/api/hooks/useSeats'
import { paymentApi } from '@/api/requests/payment'
import { cn } from '@/lib/utils'
import type { Hall, Screening, Seat } from '@/types/api'
import { SeatMapGrid } from './variants/SeatMapGrid'
import { SeatMapSvg } from './variants/SeatMapSvg'
import { SeatMapZoom } from './variants/SeatMapZoom'
import { SeatMapWasm } from './variants/SeatMapWasm'
import type { SeatMapProps } from './types'

type Variant = 'grid' | 'svg' | 'zoom' | 'wasm'

const VARIANTS: Partial<Record<Variant, React.ComponentType<SeatMapProps>>> = {
  grid: SeatMapGrid,
  svg: SeatMapSvg,
  zoom: SeatMapZoom,
  wasm: SeatMapWasm,
}

const VARIANT_LABELS: Record<Variant, string> = {
  grid: 'Grid',
  svg: 'SVG',
  zoom: 'Zoom',
  wasm: 'WASM',
}

interface BookingSummaryProps {
  selectedSeats: Seat[]
  screening: Screening
  onClear: () => void
}

function BookingSummary({ selectedSeats, screening, onClear }: BookingSummaryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const getPrice = (seat: Seat) =>
    screening.seatTypes?.find((st) => st.type === seat.type)?.price ?? seat.price

  const total = selectedSeats.reduce((sum, s) => sum + getPrice(s), 0)

  async function handlePay() {
    if (selectedSeats.length === 0) return
    setIsLoading(true)
    try {
      const data = await paymentApi.init(
        screening.id,
        selectedSeats.map((s) => ({ seatId: s.id, price: getPrice(s) })),
      )
      window.location.href = data.url
    } catch {
      toast.error('Не вдалося ініціювати оплату')
      setIsLoading(false)
    }
  }

  if (selectedSeats.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Оберіть місця для бронювання
      </p>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">
          {selectedSeats.length} {selectedSeats.length === 1 ? 'місце' : 'місця'}
        </span>
        <span className="text-xs text-muted-foreground">
          {selectedSeats.map((s) => `р.${s.row} м.${s.number}`).join(', ')}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold">{total} грн</span>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Скинути
        </button>
        <button
          onClick={handlePay}
          disabled={isLoading}
          className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {isLoading ? 'Завантаження...' : 'Оплатити'}
        </button>
      </div>
    </div>
  )
}

interface SeatMapProps2 {
  hall: Hall
  screening: Screening
}

export function SeatMap({ hall, screening }: SeatMapProps2) {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [variant, setVariant] = useState<Variant>('grid')

  const { data: seats = [], isPending, isError } = useSeats(hall.id, screening.id)

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'reserved') return
    setSelectedSeats((prev) =>
      prev.some((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat],
    )
  }

  if (isPending) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Завантаження залу…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-destructive">
        Не вдалося завантажити місця
      </div>
    )
  }

  const ActiveVariant = VARIANTS[variant]

  return (
    <div className="flex flex-col gap-6">
      {ActiveVariant ? (
        <ActiveVariant
          hall={hall}
          screening={screening}
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
        />
      ) : (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Варіант «{variant}» ще не реалізований
        </div>
      )}

      <BookingSummary
        selectedSeats={selectedSeats}
        screening={screening}
        onClear={() => setSelectedSeats([])}
      />

      <div className="flex justify-center gap-2">
        {(Object.keys(VARIANT_LABELS) as Variant[]).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              variant === v
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
              !VARIANTS[v] && 'opacity-40',
            )}
          >
            {VARIANT_LABELS[v]}
          </button>
        ))}
      </div>
    </div>
  )
}
