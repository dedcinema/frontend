import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

interface SuccessPageProps {
  searchParams: Promise<{ payment?: string; movie?: string }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { payment, movie } = await searchParams

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-green-500/15 text-4xl">
        ✓
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Оплата успішна</h1>
        {movie && (
          <p className="text-muted-foreground">{movie}</p>
        )}
        {payment && (
          <p className="text-xs text-muted-foreground">ID платежу: {payment}</p>
        )}
      </div>

      <Link
        href={ROUTES.ACCOUNT.BOOKINGS}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Мої білети
      </Link>
    </div>
  )
}
