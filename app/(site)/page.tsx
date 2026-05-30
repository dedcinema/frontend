'use client'

import { useMovies } from '@/api/hooks'
import { MovieCard } from '@/components/features/movies/MovieCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const { data: movies, isLoading, isError } = useMovies()

  if (isError) {
    return (
      <div className="container py-12 text-center text-muted-foreground">
        Не вдалося завантажити фільми. Спробуйте оновити сторінку.
      </div>
    )
  }

  return (
    <main className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Фільми</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))
          : movies?.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </main>
  )
}
