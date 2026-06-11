'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/api/hooks'
import { authApi } from '@/api/requests'
import {
  otpSendSchema,
  otpVerifySchema,
  type OtpSendForm,
  type OtpVerifyForm,
} from '@/schemas/auth/otp.schema'
import { ROUTES } from '@/constants/routes'
import { detectType } from '@/lib/detect-type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Step = 'send' | 'verify'

export function OtpForm() {
  const router = useRouter()
  const { sendOtp, verifyOtp } = useAuth()
  const [step, setStep] = useState<Step>('send')
  const [identifier, setIdentifier] = useState('')
  const [isTgLoading, setIsTgLoading] = useState(false)

  const sendForm = useForm<OtpSendForm>({
    resolver: zodResolver(otpSendSchema),
    defaultValues: { identifier: '', type: 'email' },
  })

  const verifyForm = useForm<OtpVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { code: '' },
  })

  const identifierValue = sendForm.watch('identifier')

  useEffect(() => {
    if (identifierValue) {
      sendForm.setValue('type', detectType(identifierValue))
    }
  }, [identifierValue, sendForm])

  async function handleSend(data: OtpSendForm) {
    try {
      await sendOtp.mutateAsync(data)
      setIdentifier(data.identifier)
      setStep('verify')
    } catch {
      toast.error('Не вдалося надіслати код. Спробуйте ще раз.')
    }
  }

  async function handleVerify(data: OtpVerifyForm) {
    try {
      await verifyOtp.mutateAsync({
        identifier,
        code: data.code,
        type: detectType(identifier),
      })
      router.push(ROUTES.HOME)
    } catch {
      toast.error('Невірний код. Спробуйте ще раз.')
    }
  }

  if (step === 'verify') {
    return (
      <form onSubmit={verifyForm.handleSubmit(handleVerify)} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Код надіслано на{' '}
          <span className="font-medium text-foreground">{identifier}</span>
        </p>

        <div className="space-y-2">
          <Label htmlFor="code">Код підтвердження</Label>
          <Input
            id="code"
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            {...verifyForm.register('code')}
          />
          {verifyForm.formState.errors.code && (
            <p className="text-sm text-destructive">
              {verifyForm.formState.errors.code.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={verifyOtp.isPending}>
          {verifyOtp.isPending ? 'Перевірка...' : 'Увійти'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setStep('send')}
        >
          ← Змінити{' '}
          {detectType(identifier) === 'email' ? 'email' : 'номер телефону'}
        </Button>
      </form>
    )
  }

  async function handleTelegramLogin() {
    setIsTgLoading(true)
    try {
      const data = await authApi.getTelegramUrl()
      window.location.href = data.url
    } catch (err) {
      console.error('[TG login error]', err)
      toast.error('Не вдалося отримати посилання Telegram')
      setIsTgLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={sendForm.handleSubmit(handleSend)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email або телефон</Label>
          <Input
            id="identifier"
            placeholder="you@example.com або +380..."
            {...sendForm.register('identifier')}
          />
          {sendForm.formState.errors.identifier && (
            <p className="text-sm text-destructive">
              {sendForm.formState.errors.identifier.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={sendOtp.isPending}>
          {sendOtp.isPending ? 'Надсилання...' : 'Отримати код'}
        </Button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">або</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isTgLoading}
        onClick={handleTelegramLogin}
      >
        ✈️ {isTgLoading ? 'Завантаження...' : 'Увійти через Telegram'}
      </Button>
    </div>
  )
}
