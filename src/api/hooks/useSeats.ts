import { useQuery } from '@tanstack/react-query'
import { screeningsApi } from '../requests/screenings'

export function useSeats(hallId: string, screeningId: string) {
  return useQuery({
    queryKey: ['seats', hallId, screeningId],
    queryFn: () => screeningsApi.seats(hallId, screeningId),
    enabled: !!hallId && !!screeningId,
  })
}
