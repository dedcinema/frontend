'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { isAxiosError } from 'axios'
import { paymentApi } from '@/api/requests/payment'
import { ROUTES } from '@/constants/routes'
import { isStripeCheckoutUrl } from '@/lib/payment-url'
import { redirectTo } from '@/lib/redirect'
import { useAuthStore } from '@/store/auth/auth.store'

const REDIRECT_DELAY_MS = 3000
const GENERIC_ERROR = 'Не вдалося отримати посилання, спробуйте ще раз'

const ERROR_MESSAGES: Record<number, string> = {
  404: 'Платіж не знайдено',
  409: 'Оплату вже завершено або посилання застаріло. Перевірте розділ «Мої квитки» або оформіть бронювання ще раз',
  429: 'Забагато спроб, спробуйте пізніше',
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; url: string }
  | { kind: 'error'; message: string }

const subscribe = () => () => {}

function errorMessage(error: unknown): string {
  const status = isAxiosError(error) ? error.response?.status : undefined
  return (status !== undefined && ERROR_MESSAGES[status]) || GENERIC_ERROR
}

const linkClass =
  'rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90'

export default function PayPage() {
  const { id } = useParams<{ id: string }>()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [state, setState] = useState<State>({ kind: 'loading' })
  const requested = useRef(false)
  const redirected = useRef(false)

  const goToPayment = (url: string) => {
    if (redirected.current) return
    redirected.current = true
    redirectTo(url)
  }

  useEffect(() => {
    if (!mounted || !isAuthenticated || requested.current) return
    requested.current = true
    paymentApi
      .link(id)
      .then(({ url }) => {
        setState(
          isStripeCheckoutUrl(url) ? { kind: 'ready', url } : { kind: 'error', message: GENERIC_ERROR },
        )
      })
      .catch((error: unknown) => setState({ kind: 'error', message: errorMessage(error) }))
  }, [mounted, isAuthenticated, id])

  const readyUrl = state.kind === 'ready' ? state.url : null

  useEffect(() => {
    if (!readyUrl) return
    const timer = setTimeout(() => {
      if (redirected.current) return
      redirected.current = true
      redirectTo(readyUrl)
    }, REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [readyUrl])

  if (!mounted) return null

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p>Увійдіть в акаунт, щоб перейти до оплати</p>
        <Link href={ROUTES.AUTH.LOGIN} className={linkClass}>
          Увійти
        </Link>
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p role="alert">{state.message}</p>
        <Link href={ROUTES.HOME} className={linkClass}>
          На головну
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p>Перенаправляємо на сторінку оплати…</p>
      <button
        type="button"
        disabled={!readyUrl}
        onClick={() => readyUrl && goToPayment(readyUrl)}
        className={`${linkClass} disabled:opacity-50`}
      >
        Перейти до оплати
      </button>
    </div>
  )
}
