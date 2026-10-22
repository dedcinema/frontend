'use client'

import { useSyncExternalStore } from 'react'
import Script from 'next/script'

const WIDGET_SCRIPT_SRC = 'https://unpkg.com/hanc-webrtc-widgets@2.11.0'
const VOICE_SERVICE_URL = 'https://voice.hanc.ai'
const DEFAULT_THEME = 'amber'

const subscribe = () => () => {}

export function VoiceWidget() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  const agentId = process.env.NEXT_PUBLIC_HANC_AGENT_ID
  const theme = process.env.NEXT_PUBLIC_HANC_WIDGET_THEME || DEFAULT_THEME

  if (!agentId) return null

  return (
    <div className="min-h-12 md:flex md:h-12 md:shrink-0 md:items-center">
      {mounted && (
        <hanc-ai-pill-call
          className="voice-widget"
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
    </div>
  )
}
