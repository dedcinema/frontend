import { useQuery } from '@tanstack/react-query'
import { screeningsApi } from '../requests/screenings'

export function useScreenings(params?: { movieId?: string }) {
  return useQuery({
    queryKey: ['screenings', params],
    queryFn: () => screeningsApi.list(params),
  })
}

export function useScreening(id: string) {
  return useQuery({
    queryKey: ['screening', id],
    queryFn: () => screeningsApi.byId(id),
    enabled: !!id,
  })
}

export function useMovieScreenings(movieId: string) {
  return useQuery({
    queryKey: ['screenings', 'movie', movieId],
    queryFn: () => screeningsApi.byMovie(movieId),
    enabled: !!movieId,
  })
}
