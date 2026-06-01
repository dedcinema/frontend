import type { Hall, Screening, Seat } from '@/types/api'

export interface SeatMapProps {
  hall: Hall
  screening: Screening
  seats: Seat[]
  selectedSeats: Seat[]
  onSeatClick: (seat: Seat) => void
}
