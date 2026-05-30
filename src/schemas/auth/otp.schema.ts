import { z } from 'zod'

export const otpSendSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Введіть email або номер телефону')
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\+?[\d\s\-()]{10,}$/.test(val),
      'Введіть коректний email або номер телефону'
    ),
  type: z.enum(['email', 'phone']),
})

export const otpVerifySchema = z.object({
  code: z
    .string()
    .length(6, 'Код має бути 6 цифр')
    .regex(/^\d+$/, 'Код має містити тільки цифри'),
})

export type OtpSendForm = z.infer<typeof otpSendSchema>
export type OtpVerifyForm = z.infer<typeof otpVerifySchema>
