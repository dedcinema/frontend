import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingApi, type PaymentInitPayload } from '../requests/booking'

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: bookingApi.list,
  })
}

export function useInitPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PaymentInitPayload) => bookingApi.initPayment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}
