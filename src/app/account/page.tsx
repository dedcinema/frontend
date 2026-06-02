'use client'

import { useState } from 'react'
import { useProfile } from '@/api/hooks/useProfile'
import { Skeleton } from '@/components/ui/skeleton'

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <Skeleton className="size-24 rounded-full" />
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

export default function AccountPage() {
  const { data: user, isLoading } = useProfile()
  const [avatarError, setAvatarError] = useState(false)

  if (isLoading) return <ProfileSkeleton />

  if (!user) return null

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      {user.avatar && !avatarError ? (
        <img
          src={`${process.env.NEXT_PUBLIC_S3_URL}/${user.avatar}`}
          alt={user.name}
          className="size-24 rounded-full object-cover"
          onError={() => setAvatarError(true)}
        />
      ) : (
        <div className="size-24 rounded-full bg-primary flex items-center justify-center text-3xl font-semibold text-primary-foreground">
          {user.name[0].toUpperCase()}
        </div>
      )}

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-2xl font-semibold">{user.name}</p>
        {user.email && (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        )}
        {user.phone && (
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        )}
      </div>
    </div>
  )
}
