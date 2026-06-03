import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/constants/routes'
import type { Movie } from '@/types/api'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      href={ROUTES.MOVIES.DETAILS(movie.slug)}
      className="glow-card group block overflow-hidden rounded-xl"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={`${process.env.NEXT_PUBLIC_S3_URL}${movie.poster}`}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>

      <div className="bg-card space-y-1 px-3 py-3">
        {movie.category && (
          <span className="text-technical block text-[0.7rem] uppercase tracking-widest text-primary/80">
            {movie.category.title}
          </span>
        )}
        <p className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
          {movie.title}
        </p>
        {movie.duration && (
          <p className="text-technical text-muted-foreground">
            {Math.floor(movie.duration / 60)} год {movie.duration % 60 > 0 ? `${movie.duration % 60} хв` : ''}
          </p>
        )}
      </div>
    </Link>
  )
}
