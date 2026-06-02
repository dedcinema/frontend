import type { Movie } from '@/types/api'
import { HomeCarousel } from '@/components/features/movies/HomeCarousel'

export default async function HomePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies`, {
    next: { revalidate: 180 },
  })
  const movies: Movie[] = await res.json()

  return <HomeCarousel movies={movies ?? []} />
}
