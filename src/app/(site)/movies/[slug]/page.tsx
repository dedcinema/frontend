import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScreeningList } from '@/components/features/screening/ScreeningList'
import type { Movie } from '@/types/api'

async function getMovie(slug: string): Promise<Movie | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${slug}`, {
    next: { revalidate: 180 },
  })
  if (!res.ok) return null
  return res.json()
}

function ScreeningsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function MoviePage({ params }: Props) {
  const { slug } = await params
  const movie = await getMovie(slug)

  if (!movie) notFound()

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <div className="w-full shrink-0 lg:w-72">
        <img
          src={`${process.env.NEXT_PUBLIC_S3_URL}${movie.poster}`}
          alt={movie.title}
          className="w-full rounded-xl object-cover aspect-[2/3]"
        />
      </div>

      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col gap-2">
          {movie.category && (
            <Badge variant="secondary" className="w-fit">
              {movie.category.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          {movie.description && (
            <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Сеанси</h2>
          <Suspense fallback={<ScreeningsSkeleton />}>
            <ScreeningList movieId={movie.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
