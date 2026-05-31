'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { screeningsApi } from '@/api/requests/screenings'
import type { Screening } from '@/types/api'

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
})

const timeFormatter = new Intl.DateTimeFormat('uk-UA', {
  hour: '2-digit',
  minute: '2-digit',
})

function ScreeningItem({ screening }: { screening: Screening }) {
  const start = new Date(screening.startAt)
  const end = new Date(screening.endAt)

  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium capitalize">{dateFormatter.format(start)}</span>
        <span className="text-xs text-muted-foreground">
          {timeFormatter.format(start)} — {timeFormatter.format(end)}
        </span>
      </div>
    </div>
  )
}

interface ScreeningListProps {
  movieId: string
}

export function ScreeningList({ movieId }: ScreeningListProps) {
  const { data: screenings } = useSuspenseQuery({
    queryKey: ['screenings', 'movie', movieId],
    queryFn: () => screeningsApi.byMovie(movieId),
  })

  if (screenings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Сеансів поки немає</p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {screenings.map((screening) => (
        <ScreeningItem key={screening.id} screening={screening} />
      ))}
    </div>
  )
}
