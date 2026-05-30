import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { HealthCheckProvider } from '@/providers/HealthCheckProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DedCinema',
  description: 'Сервіс бронювання квитків у кінотеатри',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
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
