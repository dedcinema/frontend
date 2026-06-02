'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { authApi, type AuthResponse } from '@/api/requests/auth'
import { useAuth } from '@/api/hooks/useAuth'

function TelegramHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { auth } = useAuth()

  useEffect(() => {
    console.log('[TG] hash:', window.location.hash || '(empty)')
    console.log('[TG] search:', window.location.search || '(empty)')

    // крок 1: hash має tgAuthResult → конвертуємо в query param і перезавантажуємо
    if (window.location.hash.includes('tgAuthResult')) {
      console.log('[TG] found tgAuthResult in hash — redirecting to query param')
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const result = hashParams.get('tgAuthResult')
      if (result) {
        window.location.replace(`/auth/telegram?tgAuthResult=${encodeURIComponent(result)}`)
        return
      }
    }

    // крок 2: query param є → верифікуємо
    const tgAuthResult = searchParams.get('tgAuthResult')
    console.log('[TG] tgAuthResult from query:', tgAuthResult ? tgAuthResult.slice(0, 20) + '...' : null)

    if (tgAuthResult) {
      authApi
        .verifyTelegram(tgAuthResult)
        .then((data) => {
          console.log('[TG] verify success, has url:', !!(data as AuthResponse & { url?: string }).url)
          const res = data as AuthResponse & { url?: string }
          if (res.url) {
            window.location.href = res.url
          } else {
            auth(data)
            router.replace('/')
          }
        })
        .catch((err) => {
          console.error('[TG] verify error:', err)
          toast.error('Помилка авторизації через Telegram')
          router.replace('/auth/login')
        })
      return
    }

    // крок 3: нічого немає → логін
    console.log('[TG] no tgAuthResult found — redirecting to login')
    router.replace('/auth/login')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      Завантаження...
    </div>
  )
}

export default function TelegramPage() {
  return (
    <Suspense>
      <TelegramHandler />
    </Suspense>
  )
}
