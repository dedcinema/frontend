'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { ROUTES } from '@/constants/routes'
import type { Movie } from '@/types/api'

interface HomeCarouselProps {
  movies: Movie[]
}

export function HomeCarousel({ movies }: HomeCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })

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

  if (movies.length === 0) return null

  return (
    <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }} className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="min-w-0 shrink-0 basis-full sm:basis-1/2 lg:basis-1/4 px-0.5"
            >
              <Link
                href={ROUTES.MOVIES.DETAILS(movie.slug)}
                className="group relative block aspect-[2/3] overflow-hidden"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_S3_URL}${movie.poster}`}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <p className="absolute bottom-0 left-0 right-0 p-3 text-sm font-semibold text-white line-clamp-2">
                  {movie.title}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        aria-label="Попередній"
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/80"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Наступний"
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/80"
      >
        <ChevronRight className="size-6" />
      </button>
    </div>
  )
}
