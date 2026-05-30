import { useQuery } from '@tanstack/react-query'
import { moviesApi } from '../requests/movies'

export function useMovies(params?: { category?: string; random?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => moviesApi.list(params),
  })
}

export function useMovie(slug: string) {
  return useQuery({
    queryKey: ['movie', slug],
    queryFn: () => moviesApi.bySlug(slug),
    enabled: !!slug,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: moviesApi.categories,
  })
}
