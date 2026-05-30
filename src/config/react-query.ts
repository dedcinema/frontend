import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 3 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 1 },
    },
  })
}
