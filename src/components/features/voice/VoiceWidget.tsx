'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import Script from 'next/script'
import { voiceApi } from '@/api/requests/voice'
import { cookies } from '@/lib/cookies'
import { linkVoiceCall, readVoiceIdentity } from '@/lib/voice-link'
import { useAuthStore } from '@/store/auth/auth.store'

const WIDGET_SCRIPT_SRC = 'https://unpkg.com/hanc-webrtc-widgets@2.11.0'
const VOICE_SERVICE_URL = 'https://voice.hanc.ai'
const DEFAULT_THEME = 'amber'

const subscribe = () => () => {}
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const debugLog = (message: string) => {
  if (process.env.NEXT_PUBLIC_VOICE_LINK_DEBUG === 'true') {
    console.debug(`[voice-link] ${message}`)
  }
}

export function VoiceWidget() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  const agentId = process.env.NEXT_PUBLIC_HANC_AGENT_ID
  const theme = process.env.NEXT_PUBLIC_HANC_WIDGET_THEME || DEFAULT_THEME
  const widgetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = widgetRef.current
    if (!el) return

    let unmounted = false
    let inFlight = false

    const onCallStart = () => {
      if (inFlight) return
      inFlight = true
      void linkVoiceCall({
        isAuthenticated: () => useAuthStore.getState().isAuthenticated,
        getToken: () => cookies.get('accessToken'),
        readIdentity: readVoiceIdentity,
        link: voiceApi.link,
        wait,
        isCancelled: () => unmounted,
        log: debugLog,
      }).finally(() => {
        inFlight = false
      })
    }

    el.addEventListener('call-start', onCallStart)
    return () => {
      unmounted = true
      el.removeEventListener('call-start', onCallStart)
    }
  }, [mounted, agentId])

  if (!agentId) return null

  return (
    <>
      {mounted && (
        <hanc-ai-pill-floating-call
          ref={widgetRef}
          className="voice-widget"
          position="bottom-right"
          agent-id={agentId}
          theme={theme}
          theme-mode="dark"
          voice-service-url={VOICE_SERVICE_URL}
          button-start-text="Поговорити з агентом"
          button-connecting-text="З'єднання..."
          button-end-text="Завершити розмову"
          orb-size={40}
        />
      )}
      <Script src={WIDGET_SCRIPT_SRC} strategy="lazyOnload" />
    </>
  )
}
