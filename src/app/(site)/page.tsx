import type { Movie } from '@/types/api'
import { HomeCarousel } from '@/components/features/movies/HomeCarousel'
import { pluralizeUk } from '@/lib/plural'

async function getMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies?limit=100`, {
      next: { revalidate: 180 },
    })
    if (!res.ok) return []
    const data: unknown = await res.json()
    return Array.isArray(data) ? (data as Movie[]) : []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const movies = await getMovies()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Кіно в твоєму місті
        </h1>
        <p className="whitespace-nowrap text-sm text-muted-foreground">
          Вибирай сеанс, броюй місця онлайн — без черг і дзвінків.
        </p>

        {movies.length > 0 && (
          <p className="text-technical flex items-center gap-2 text-muted-foreground">
            <span className="text-primary">●</span>
            <span>
              {movies.length} {pluralizeUk(movies.length, ['фільм', 'фільми', 'фільмів'])} у прокаті
            </span>
          </p>
        )}
      </div>

      <HomeCarousel movies={movies} />
    </div>
  )
}
