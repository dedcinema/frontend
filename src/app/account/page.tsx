'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'
import { useProfile, useUpdateAvatar, useUpdateProfile } from '@/api/hooks/useProfile'
import { usersApi } from '@/api/requests/users'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_AVATAR_SIZE = 10 * 1024 * 1024

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-10">
      <Card className="flex flex-col items-center gap-4 p-8">
        <Skeleton className="size-24 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </Card>
      <Card className="space-y-3 p-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-24" />
      </Card>
      <Card className="space-y-2 p-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-5 w-40" />
      </Card>
      <Card className="space-y-2 p-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-32" />
      </Card>
    </div>
  )
}

type ContactStep = 'idle' | 'init' | 'confirm'

interface ContactFieldProps {
  label: string
  current: string | null | undefined
  inputType: 'email' | 'tel'
  placeholder: string
  initFn: (value: string) => Promise<unknown>
  confirmFn: (value: string, code: string) => Promise<unknown>
  onSuccess: () => void
}

function ContactField({
  label,
  current,
  inputType,
  placeholder,
  initFn,
  confirmFn,
  onSuccess,
}: ContactFieldProps) {
  const [step, setStep] = useState<ContactStep>('idle')
  const [value, setValue] = useState('')
  const [code, setCode] = useState('')

  const reset = () => {
    setStep('idle')
    setValue('')
    setCode('')
  }

  const initMutation = useMutation({
    mutationFn: () => initFn(value),
    onSuccess: () => {
      toast.success('Код підтвердження надіслано')
      setStep('confirm')
    },
    onError: () => toast.error('Не вдалось надіслати код'),
  })

  const confirmMutation = useMutation({
    mutationFn: () => confirmFn(value, code),
    onSuccess: () => {
      toast.success(`${label} оновлено`)
      onSuccess()
      reset()
    },
    onError: () => toast.error('Невірний код підтвердження'),
  })

  if (step === 'idle') {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate font-medium">{current || 'не вказано'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setStep('init')}>
          Змінити
        </Button>
      </div>
    )
  }

  if (step === 'init') {
    return (
      <div className="space-y-3">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === 'Enter' && value && initMutation.mutate()}
          />
          <Button
            onClick={() => initMutation.mutate()}
            disabled={!value.trim() || initMutation.isPending}
          >
            {initMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Надіслати код
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          Скасувати
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label>Код підтвердження</Label>
      <p className="text-sm text-muted-foreground">Код надіслано на {value}</p>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
          onKeyDown={(e) => e.key === 'Enter' && code && confirmMutation.mutate()}
        />
        <Button
          onClick={() => confirmMutation.mutate()}
          disabled={!code.trim() || confirmMutation.isPending}
        >
          {confirmMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Підтвердити
        </Button>
      </div>
      <Button variant="ghost" size="sm" onClick={reset}>
        Скасувати
      </Button>
    </div>
  )
}

export default function AccountPage() {
  const { data: user, isLoading, refetch } = useProfile()
  const updateProfile = useUpdateProfile()
  const updateAvatar = useUpdateAvatar()

  const [avatarError, setAvatarError] = useState(false)
  const [name, setName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  if (isLoading) return <ProfileSkeleton />
  if (!user) return null

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('Файл занадто великий. Максимальний розмір — 10 МБ')
      return
    }

    updateAvatar.mutate(file, {
      onSuccess: () => {
        toast.success('Аватар оновлено')
        setAvatarError(false)
      },
      onError: () => toast.error('Не вдалось оновити аватар'),
    })

    e.target.value = ''
  }

  const handleNameSave = () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === user.name) return

    updateProfile.mutate(trimmed, {
      onSuccess: () => toast.success("Ім'я збережено"),
      onError: () => toast.error("Не вдалось зберегти ім'я"),
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 py-10">
      {/* Avatar */}
      <Card className="flex flex-col items-center gap-4 p-8">
        <div className="relative">
          {user.avatar && !avatarError ? (
            <img
              src={`${process.env.NEXT_PUBLIC_S3_URL}/${user.avatar}`}
              alt={user.name}
              className="size-24 rounded-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground">
              {user.name[0]?.toUpperCase()}
            </div>
          )}

          {updateAvatar.isPending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={updateAvatar.isPending}
        >
          <Camera className="mr-2 size-4" />
          Змінити фото
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept={AVATAR_ACCEPT}
          className="hidden"
          onChange={handleAvatarChange}
        />
      </Card>

      {/* Name */}
      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Ім'я</h2>
        <div className="space-y-2">
          <Label htmlFor="name">Ваше ім'я</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
          />
        </div>
        <Button
          onClick={handleNameSave}
          disabled={!name.trim() || name.trim() === user.name || updateProfile.isPending}
          size="sm"
        >
          {updateProfile.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Зберегти
        </Button>
      </Card>

      {/* Email */}
      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Email</h2>
        <ContactField
          label="Електронна пошта"
          current={user.email}
          inputType="email"
          placeholder="new@email.com"
          initFn={(email) => usersApi.emailInit(email)}
          confirmFn={(email, code) => usersApi.emailConfirm(email, code)}
          onSuccess={() => refetch()}
        />
      </Card>

      {/* Phone */}
      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Телефон</h2>
        <ContactField
          label="Номер телефону"
          current={user.phone}
          inputType="tel"
          placeholder="+380XXXXXXXXX"
          initFn={(phone) => usersApi.phoneInit(phone)}
          confirmFn={(phone, code) => usersApi.phoneConfirm(phone, code)}
          onSuccess={() => refetch()}
        />
      </Card>
    </div>
  )
}
