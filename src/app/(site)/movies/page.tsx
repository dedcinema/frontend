import { Suspense } from 'react'
import Link from 'next/link'
import type { Movie, Category } from '@/types/api'
import { MovieCard } from '@/components/features/movies/MovieCard'
import { MovieGridSkeleton } from '@/components/features/movies/MovieGridSkeleton'
import { MoviesPagination } from '@/components/features/movies/MoviesPagination'
import { paginate } from '@/lib/paginate'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12
const CATALOG_ANCHOR = 'catalog'

async function MovieGrid({ category, page: rawPage }: { category?: string; page?: string }) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/movies`)
  url.searchParams.set('limit', '100')
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

  const { items, page, totalPages } = paginate(movies, rawPage, PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <MoviesPagination
        page={page}
        totalPages={totalPages}
        category={category}
        anchorId={CATALOG_ANCHOR}
      />
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
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { category, page } = await searchParams

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    next: { revalidate: 3600 },
  })
  const categories: Category[] = await res.json()

  return (
    <div id={CATALOG_ANCHOR} className="scroll-mt-20 space-y-6">
      <CategoryFilter categories={categories ?? []} active={category} />
      <Suspense key={category} fallback={<MovieGridSkeleton />}>
        <MovieGrid category={category} page={page} />
      </Suspense>
    </div>
  )
}
