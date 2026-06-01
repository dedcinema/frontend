import { notFound } from 'next/navigation'
import { SeatMap } from '@/components/features/screening/SeatMap'
import type { Hall, Screening } from '@/types/api'

interface ScreeningDetails extends Screening {
  hall: { id: string; name: string }
  movie?: { title: string }
}

async function getScreening(id: string): Promise<ScreeningDetails | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/screenings/${id}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return res.json()
}

async function getHall(id: string): Promise<Hall | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/halls/${id}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  return res.json()
}

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const timeFormatter = new Intl.DateTimeFormat('uk-UA', {
  hour: '2-digit',
  minute: '2-digit',
})

interface Props {
  params: Promise<{ id: string }>
}

export default async function ScreeningPage({ params }: Props) {
  const { id } = await params

  const screening = await getScreening(id)
  if (!screening) notFound()

  const hall = await getHall(screening.hall.id)
  if (!hall) notFound()

  const start = new Date(screening.startAt)
  const end = new Date(screening.endAt)

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          {screening.movie?.title ?? 'Сеанс'}
        </h1>
        <p className="text-muted-foreground capitalize">
          {dateFormatter.format(start)}, {timeFormatter.format(start)}–{timeFormatter.format(end)}
        </p>
        <p className="text-sm text-muted-foreground">{hall.name}</p>
      </div>

      <SeatMap hall={hall} screening={screening} />
    </div>
  )
}
