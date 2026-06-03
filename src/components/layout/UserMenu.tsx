'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { LogOut, Ticket, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth/auth.store'
import { useAuth } from '@/api/hooks/useAuth'
import type { User as UserType } from '@/types/api'

function Avatar({ user }: { user: UserType }) {
  const [avatarError, setAvatarError] = useState(false)

  if (user.avatar && !avatarError) {
    return (
      <img
        src={`${process.env.NEXT_PUBLIC_S3_URL}/${user.avatar}`}
        alt={user.name}
        className="size-8 rounded-full object-cover"
        onError={() => setAvatarError(true)}
      />
    )
  }

  return (
    <div className="size-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
      {user.name[0].toUpperCase()}
    </div>
  )
}

export function UserMenu() {
  const { isAuthenticated, user } = useAuthStore()
  const { exit } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isAuthenticated || !user) {
    return (
      <Button asChild size="sm">
        <Link href={ROUTES.AUTH.LOGIN}>Увійти</Link>
      </Button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 outline-none hover:opacity-80 transition-opacity"
      >
        <Avatar user={user} />
        <span className="text-sm font-medium">{user.name}</span>
      </button>

      {open && (
        <nav className="surface absolute right-0 top-11 z-50 flex flex-col rounded-xl overflow-hidden shadow-xl">
          <Link
            href={ROUTES.ACCOUNT.ROOT}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
          >
            <User className="size-4 shrink-0" />
            Профіль
          </Link>
          <Link
            href={ROUTES.ACCOUNT.BOOKINGS}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
          >
            <Ticket className="size-4 shrink-0" />
            Мої білети
          </Link>
          <button
            onClick={() => { setOpen(false); exit() }}
            className="flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            Вийти
          </button>
        </nav>
      )}
    </div>
  )
}
