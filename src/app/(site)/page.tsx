'use client'

import { useMovies } from '@/api/hooks/useMovies'
import { MovieCard } from '@/components/features/movies/MovieCard'
import { Skeleton } from '@/components/ui/skeleton'

const SKELETON_COUNT = 10

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const { data: movies, isLoading } = useMovies()

  if (isLoading) return <MovieGridSkeleton />

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
