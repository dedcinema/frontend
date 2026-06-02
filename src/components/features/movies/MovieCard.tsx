import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import type { Movie } from '@/types/api'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={ROUTES.MOVIES.DETAILS(movie.slug)}>
      <Card className="overflow-hidden transition-all hover:ring-2 hover:ring-primary">
        <div className="relative aspect-[2/3]">
          <Image
            src={`${process.env.NEXT_PUBLIC_S3_URL}${movie.poster}`}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>
        <CardContent className="p-3 space-y-1">
          {movie.category && (
            <Badge variant="secondary" className="text-xs">
              {movie.category.title}
            </Badge>
          )}
          <CardTitle className="line-clamp-2">{movie.title}</CardTitle>
        </CardContent>
      </Card>
    </Link>
  )
}
