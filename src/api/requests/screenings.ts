import { api } from '../instance'
import type { Screening, Seat } from '@/types/api'

export const screeningsApi = {
  list: (params?: { movieId?: string }) =>
    api.get<Screening[]>('/screenings', { params }).then((r) => r.data),

  byId: (id: string) =>
    api.get<Screening>(`/screenings/${id}`).then((r) => r.data),

  byMovie: (movieId: string) =>
    api.get<Screening[]>(`/screenings/movie/${movieId}`).then((r) => r.data),

  seats: (hallId: string, screeningId: string) =>
    api.get<Seat[]>(`/seats/${hallId}/${screeningId}`).then((r) => r.data),
}
