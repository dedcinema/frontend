import { OtpForm } from '@/components/features/auth/OtpForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Вхід</h1>
          <p className="text-sm text-muted-foreground">
            Введіть email або телефон — надішлемо код
          </p>
        </div>

        <OtpForm />
      </div>
    </main>
  )
}
