import { Suspense } from 'react'
import Link from 'next/link'
import type { Movie, Category } from '@/types/api'
import { MovieCard } from '@/components/features/movies/MovieCard'
import { MovieGridSkeleton } from '@/components/features/movies/MovieGridSkeleton'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

async function MovieGrid({ category }: { category?: string }) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/movies`)
  if (category) url.searchParams.set('category', category)

  const res = await fetch(url.toString(), { next: { revalidate: 180 } })
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

function CategoryFilter({ categories, active }: { categories: Category[]; active?: string }) {
  const triggerBase =
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all'
  const triggerActive = 'bg-background text-foreground shadow-sm'
  const triggerInactive = 'text-muted-foreground hover:text-foreground'

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground">
        <Link
          href={ROUTES.MOVIES.LIST}
          className={cn(triggerBase, !active ? triggerActive : triggerInactive)}
        >
          Всі
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`${ROUTES.MOVIES.LIST}?category=${cat.slug}`}
            className={cn(triggerBase, active === cat.slug ? triggerActive : triggerInactive)}
          >
            {cat.title}
          </Link>
        ))}
      </div>
    </div>
  )
}

interface MoviesPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { category } = await searchParams

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    next: { revalidate: 3600 },
  })
  const categories: Category[] = await res.json()

  return (
    <div className="space-y-6">
      <CategoryFilter categories={categories ?? []} active={category} />
      <Suspense key={category} fallback={<MovieGridSkeleton />}>
        <MovieGrid category={category} />
      </Suspense>
    </div>
  )
}
