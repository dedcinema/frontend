import { api, instance } from '../instance'
import type { User } from '@/types/api'

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface OtpSendPayload {
  identifier: string
  type: 'email' | 'phone'
}

export interface OtpVerifyPayload {
  identifier: string
  code: string
  type: 'email' | 'phone'
}

export const authApi = {
  sendOtp: (payload: OtpSendPayload) =>
    api.post('/auth/otp/send', payload).then((r) => r.data),

  verifyOtp: (payload: OtpVerifyPayload) =>
    api.post<AuthResponse>('/auth/otp/verify', payload).then((r) => r.data),

  logout: () =>
    instance.post('/auth/logout').then((r) => r.data),

  getTelegramUrl: () =>
    api.get<{ url: string }>('/auth/telegram').then((r) => r.data),

  verifyTelegram: (tgAuthResult: string) =>
    api.post<AuthResponse>('/auth/telegram/verify', { tgAuthResult }).then((r) => r.data),

  finalizeTelegram: (sessionId: string) =>
    api.post<AuthResponse>('/auth/telegram/finalize', { sessionId }).then((r) => r.data),
}
