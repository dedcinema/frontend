'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { makeQueryClient } from '@/config/react-query'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
