import { notFound } from 'next/navigation'
import { SeatMap } from '@/components/features/screening/SeatMap'
import type { Hall, Movie, Screening } from '@/types/api'

async function getScreening(id: string): Promise<Screening | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/screenings/${id}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return res.json()
}

async function getMovie(slug: string): Promise<Movie | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${slug}`, {
    next: { revalidate: 3600 },
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

  const [hall, movie] = await Promise.all([
    getHall(screening.hall.id),
    screening.movie?.slug ? getMovie(screening.movie.slug) : null,
  ])
  if (!hall) notFound()

  // Merge banner into screening.movie so SeatMapWasm can use it
  const screeningWithBanner: Screening = movie?.banner
    ? { ...screening, movie: { ...screening.movie!, banner: movie.banner } }
    : screening

  const start = new Date(screening.startAt)
  const end = new Date(screening.endAt)

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          {screeningWithBanner.movie?.title ?? 'Сеанс'}
        </h1>
        <p className="text-muted-foreground capitalize">
          {dateFormatter.format(start)}, {timeFormatter.format(start)}–{timeFormatter.format(end)}
        </p>
        <p className="text-sm text-muted-foreground">{hall.name}</p>
      </div>

      <SeatMap hall={hall} screening={screeningWithBanner} />
    </div>
  )
}
