import { instance } from '../instance'
import type { Booking } from '@/types/api'

export interface PaymentInitPayload {
  screeningId: string
  seats: Array<{ row: number; column: number }>
}

export interface PaymentInitResponse {
  paymentUrl: string
}

export const bookingApi = {
  list: () =>
    instance.get<Booking[]>('/booking').then((r) => r.data),

  initPayment: (payload: PaymentInitPayload) =>
    instance.post<PaymentInitResponse>('/payment/init', payload).then((r) => r.data),
}
