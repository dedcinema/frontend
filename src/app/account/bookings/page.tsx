'use client'

import Image from 'next/image'
import { useBookings } from '@/api/hooks/useBookings'
import { Skeleton } from '@/components/ui/skeleton'
import type { BookingDetails } from '@/types/api'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function BookingSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border p-4">
      <Skeleton className="w-16 shrink-0 rounded-lg aspect-[2/3]" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="size-20 shrink-0 rounded-lg" />
    </div>
  )
}

function BookingCard({ booking }: { booking: BookingDetails }) {
  const seats = booking.seats.map((s) => `Ряд ${s.row}, місце ${s.number}`).join(' · ')

  return (
    <div className="flex gap-4 rounded-xl border p-4">
      <div className="relative w-16 shrink-0 self-start overflow-hidden rounded-lg aspect-[2/3]">
        <Image
          src={`${process.env.NEXT_PUBLIC_S3_URL}${booking.movie.poster}`}
          alt={booking.movie.title}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <p className="font-semibold truncate">{booking.movie.title}</p>
        <p className="text-sm text-muted-foreground">{booking.screeningTime}</p>
        <p className="text-sm text-muted-foreground">
          {booking.theater.name} · {booking.hall.name}
        </p>
        <p className="text-sm text-muted-foreground truncate">{seats}</p>
      </div>

      {booking.qrCode && (
        <img
          src={booking.qrCode}
          alt="QR код"
          className="size-20 shrink-0 self-start rounded-lg"
        />
      )}
    </div>
  )
}

export default function BookingsPage() {
  const { data: bookings, isLoading } = useBookings()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <BookingSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium">Бронювань поки немає</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Придбайте квиток на будь-який сеанс
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  )
}
