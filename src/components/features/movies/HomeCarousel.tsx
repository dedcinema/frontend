'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { ROUTES } from '@/constants/routes'
import type { Movie } from '@/types/api'
import { HomeCarouselSkeleton } from './HomeCarouselSkeleton'

const CAROUSEL_SIZE = 10

const subscribe = () => () => {}

function pickRandom(movies: Movie[], count: number): Movie[] {
  const copy = [...movies]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

interface HomeCarouselProps {
  movies: Movie[]
}

export function HomeCarousel({ movies: allMovies }: HomeCarouselProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const movies = useMemo(
    () => (mounted ? pickRandom(allMovies, CAROUSEL_SIZE) : null),
    [mounted, allMovies],
  )
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [snapCount, setSnapCount] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const root = emblaApi.rootNode()

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0) emblaApi.scrollNext()
      else emblaApi.scrollPrev()
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())

    setSnapCount(emblaApi.scrollSnapList().length)
    onSelect()

    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  if (allMovies.length === 0) return null

  return (
    <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }} className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        {movies === null ? (
          <HomeCarouselSkeleton />
        ) : (
        <div className="flex">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="min-w-0 shrink-0 basis-full px-0.5 sm:basis-1/2 lg:basis-1/4"
            >
              <Link
                href={ROUTES.MOVIES.DETAILS(movie.slug)}
                className="glow-card group relative block aspect-[2/3] overflow-hidden rounded-xl"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_S3_URL}${movie.poster}`}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {movie.category && (
                    <span className="text-technical mb-1 inline-block text-[0.7rem] uppercase tracking-widest text-primary/80">
                      {movie.category.title}
                    </span>
                  )}
                  <p className="text-sm font-semibold leading-snug text-white line-clamp-2">
                    {movie.title}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
        )}
      </div>

      <button
        onClick={scrollPrev}
        aria-label="Попередній"
        className="surface absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white transition-colors hover:text-primary"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Наступний"
        className="surface absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white transition-colors hover:text-primary"
      >
        <ChevronRight className="size-6" />
      </button>

      {snapCount > 1 && (
        <div className="flex justify-center gap-1.5 pb-3 pt-6">
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Слайд ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? 'w-4 bg-primary'
                  : 'w-1.5 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
