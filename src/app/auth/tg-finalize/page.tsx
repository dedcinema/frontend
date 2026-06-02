'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '@/api/requests/auth'
import { useAuth } from '@/api/hooks/useAuth'

function TgFinalizeHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { auth } = useAuth()

  useEffect(() => {
    const session = searchParams.get('session')

    if (!session) {
      router.replace('/auth/login')
      return
    }

    authApi
      .finalizeTelegram(session)
      .then((data) => {
        auth(data)
        router.replace('/')
      })
      .catch(() => {
        toast.error('Помилка завершення авторизації через Telegram')
        router.replace('/auth/login')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      Завантаження...
    </div>
  )
}

export default function TgFinalizePage() {
  return (
    <Suspense>
      <TgFinalizeHandler />
    </Suspense>
  )
}
