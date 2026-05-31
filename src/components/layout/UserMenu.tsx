'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth/auth.store'

export function UserMenu() {
  const { isAuthenticated, user } = useAuthStore()
  const [avatarError, setAvatarError] = useState(false)

  if (isAuthenticated && user) {
    return (
      <Link
        href={ROUTES.ACCOUNT.ROOT}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {user.avatar && !avatarError ? (
          <img
            src={`${process.env.NEXT_PUBLIC_S3_URL}/${user.avatar}`}
            alt={user.name}
            className="rounded-full object-cover size-8"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="size-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
            {user.name[0].toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium">{user.name}</span>
      </Link>
    )
  }

  return (
    <Button asChild size="sm">
      <Link href={ROUTES.AUTH.LOGIN}>Увійти</Link>
    </Button>
  )
}
