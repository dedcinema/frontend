import { api } from '../instance'
import type { Movie, Category } from '@/types/api'

export const moviesApi = {
  list: (params?: { category?: string; random?: boolean; limit?: number }) =>
    api.get<Movie[]>('/movies', { params }).then((r) => r.data),

  bySlug: (slug: string) =>
    api.get<Movie>(`/movies/${slug}`).then((r) => r.data),

  categories: () =>
    api.get<Category[]>('/categories').then((r) => r.data),
}
