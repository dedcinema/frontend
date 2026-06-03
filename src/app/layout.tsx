import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { HealthCheckProvider } from '@/providers/HealthCheckProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { CurrentUserSync } from '@/components/layout/CurrentUserSync'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DedCinema',
  description: 'Онлайн-сервіс кінотеатрів',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={jetbrainsMono.variable}>
        <ReactQueryProvider>
          <ThemeProvider>
            <HealthCheckProvider>
              <CurrentUserSync />
              <ToastProvider />
              {children}
            </HealthCheckProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
