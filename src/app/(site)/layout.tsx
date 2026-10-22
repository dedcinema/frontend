import { Header } from '@/components/layout/Header'
import { VoiceWidget } from '@/components/features/voice/VoiceWidget'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <VoiceWidget />
    </>
  )
}
