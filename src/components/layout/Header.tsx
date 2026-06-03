'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants/routes'
import { UserMenu } from './UserMenu'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link href={ROUTES.HOME} className="flex items-center gap-2.5 select-none">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <span className="text-[11px] font-black leading-none tracking-tight text-primary-foreground">
              DC
            </span>
          </div>
          <span className="font-semibold tracking-tight">
            Ded<span className="text-primary">Cinema</span>
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href={ROUTES.MOVIES.LIST}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Фільми
          </Link>
          <UserMenu />
        </div>

      </div>
    </header>
  )
}
