import type { Movie } from '@/types/api'
import { HomeCarousel } from '@/components/features/movies/HomeCarousel'
import { VoiceWidget } from '@/components/features/voice/VoiceWidget'

export default async function HomePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies`, {
    next: { revalidate: 180 },
  })
  const movies: Movie[] = (await res.json()) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
              <span>{movies.length} фільмів у прокаті</span>
            </p>
          )}
        </div>

        <VoiceWidget />
      </div>

      <HomeCarousel movies={movies} />
    </div>
  )
}
