import { Suspense } from 'react'
import type { Movie } from '@/types/api'
import { MovieCard } from '@/components/features/movies/MovieCard'
import { MovieGridSkeleton } from '@/components/features/movies/MovieGridSkeleton'

async function MovieGrid() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies`, {
    next: { revalidate: 180 },
  })
  const movies: Movie[] = await res.json()

  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium">Фільмів поки немає</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Спробуйте повернутися пізніше
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<MovieGridSkeleton />}>
      <MovieGrid />
    </Suspense>
  )
}
