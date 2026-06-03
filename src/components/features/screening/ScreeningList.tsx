'use client'

import Link from 'next/link'
import { useSuspenseQuery } from '@tanstack/react-query'
import { screeningsApi } from '@/api/requests/screenings'
import { ROUTES } from '@/constants/routes'
import type { Screening } from '@/types/api'

const weekdayFmt = new Intl.DateTimeFormat('uk-UA', { weekday: 'short' })
const dateFmt = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit' })

function formatDate(d: Date): string {
  const weekday = weekdayFmt.format(d).replace(/\.$/, '')
  return `${weekday}, ${dateFmt.format(d)}`
}

function groupByTheater(screenings: Screening[]): Map<string, Screening[]> {
  return screenings.reduce((map, s) => {
    const key = s.theater.name
    const group = map.get(key) ?? []
    group.push(s)
    return map.set(key, group)
  }, new Map<string, Screening[]>())
}

function ScreeningCard({ screening }: { screening: Screening }) {
  const start = new Date(screening.startAt)
  const end = new Date(screening.endAt)

  return (
    <div className="flex flex-col items-start gap-1">
      <Link
        href={ROUTES.SCREENINGS.DETAILS(screening.id)}
        className="rounded-lg border px-4 py-3 transition-colors hover:bg-accent"
      >
        <div className="text-sm font-medium capitalize">{formatDate(start)}</div>
        <div className="text-xs text-muted-foreground">
          {timeFmt.format(start)} — {timeFmt.format(end)}
        </div>
      </Link>
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
    return <p className="text-sm text-muted-foreground">Сеансів поки немає</p>
  }

  const byTheater = groupByTheater(screenings)

  return (
    <div className="flex flex-col gap-6">
      {Array.from(byTheater.entries()).map(([theaterName, items]) => (
        <div key={theaterName} className="flex flex-col gap-3">
          <h3 className="font-semibold">{theaterName}</h3>
          <div className="flex flex-wrap gap-2">
            {items.map((screening) => (
              <ScreeningCard key={screening.id} screening={screening} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
