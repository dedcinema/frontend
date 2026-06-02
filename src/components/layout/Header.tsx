'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants/routes'
import { UserMenu } from './UserMenu'

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={ROUTES.HOME} className="text-xl font-bold tracking-tight">
          DedCinema
        </Link>

        <nav>
          <Link
            href={ROUTES.MOVIES.LIST}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Фільми
          </Link>
        </nav>

        <UserMenu />
      </div>
    </header>
  )
}
