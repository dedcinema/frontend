import { instance } from '../instance'

interface PaymentInitResponse {
  url: string
  paymentId: string
}

interface PaymentLinkResponse {
  url: string
}

interface SeatPayload {
  seatId: string
  price: number
}

export const paymentApi = {
  init: (screeningId: string, seats: SeatPayload[]) =>
    instance
      .post<PaymentInitResponse>('/payment/init', { screeningId, seats })
      .then((r) => r.data),

  link: (paymentId: string) =>
    instance
      .get<PaymentLinkResponse>(`/payment/${encodeURIComponent(paymentId)}/link`)
      .then((r) => r.data),
}
