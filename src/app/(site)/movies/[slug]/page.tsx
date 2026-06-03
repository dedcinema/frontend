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

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} год ${m} хв` : `${h} год`
}

function formatYear(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString()
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

  const s3 = process.env.NEXT_PUBLIC_S3_URL

  const metaParts = [
    movie.country,
    movie.releaseDate ? formatYear(movie.releaseDate) : undefined,
    movie.duration ? formatDuration(movie.duration) : undefined,
  ].filter(Boolean) as string[]

  return (
    <>
      {/* Banner — breaks out of site container */}
      <div className="relative -mt-8 h-[480px] w-screen left-1/2 -translate-x-1/2 overflow-hidden sm:h-[540px]">
        {movie.banner ? (
          <img
            src={`${s3}${movie.banner}`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />

        <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-end gap-6 pb-8">
            <div className="hidden shrink-0 sm:block">
              <img
                src={`${s3}${movie.poster}`}
                alt={movie.title}
                className="w-[270px] aspect-[2/3] rounded-xl object-cover shadow-2xl"
              />
            </div>

            <div className="flex flex-col gap-2 pb-1 text-white">
              <div className="flex flex-wrap items-center gap-2">
                {movie.category && (
                  <Badge variant="secondary">{movie.category.title}</Badge>
                )}
                {movie.ratingAge != null && (
                  <Badge variant="outline" className="border-white/40 text-white">
                    {movie.ratingAge}+
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{movie.title}</h1>

              {metaParts.length > 0 && (
                <p className="text-sm text-white/70">{metaParts.join(' · ')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content below banner */}
      <div className="mt-8 flex flex-col gap-8">
        <div className="sm:hidden">
          <img
            src={`${s3}${movie.poster}`}
            alt={movie.title}
            className="w-[140px] aspect-[2/3] rounded-xl object-cover shadow-lg"
          />
        </div>

        {movie.description && (
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Про фільм</h2>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">{movie.description}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Сеанси</h2>
          <Suspense fallback={<ScreeningsSkeleton />}>
            <ScreeningList movieId={movie.id} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
