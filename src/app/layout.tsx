import type { Metadata } from 'next'
import '@/styles/globals.css'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { HealthCheckProvider } from '@/providers/HealthCheckProvider'
import { ToastProvider } from '@/providers/ToastProvider'

export const metadata: Metadata = {
  title: 'DedCinema',
  description: 'Онлайн-сервіс кінотеатрів',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        <ReactQueryProvider>
          <ThemeProvider>
            <HealthCheckProvider>
              <ToastProvider />
              {children}
            </HealthCheckProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
