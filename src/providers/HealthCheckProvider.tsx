'use client'

import { useEffect, useState } from 'react'
import { api } from '@/api/instance'

export function HealthCheckProvider({ children }: { children: React.ReactNode }) {
  const [isHealthy, setIsHealthy] = useState(true)

  useEffect(() => {
    api.get('/health').catch(() => setIsHealthy(false))
  }, [])

  if (!isHealthy) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Сервіс тимчасово недоступний</h1>
          <p className="mt-2 text-muted-foreground">Спробуйте оновити сторінку пізніше</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
