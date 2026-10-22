'use client'

import { useSyncExternalStore } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

const WIDGET_SCRIPT_SRC = 'https://unpkg.com/hanc-webrtc-widgets@2.11.0'
const VOICE_SERVICE_URL = 'https://voice.hanc.ai'
const DEFAULT_THEME = 'tangerine'

function isWidgetPage(pathname: string) {
  return (
    pathname === ROUTES.HOME ||
    pathname === ROUTES.MOVIES.LIST ||
    pathname.startsWith(`${ROUTES.MOVIES.LIST}/`)
  )
}

const subscribe = () => () => {}

export function VoiceWidget() {
  const pathname = usePathname()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  const agentId = process.env.NEXT_PUBLIC_HANC_AGENT_ID
  const theme = process.env.NEXT_PUBLIC_HANC_WIDGET_THEME || DEFAULT_THEME

  if (!agentId || !mounted || !isWidgetPage(pathname)) return null

  return (
    <>
      <hanc-ai-inline-call
        agent-id={agentId}
        theme={theme}
        voice-service-url={VOICE_SERVICE_URL}
      />
      <Script src={WIDGET_SCRIPT_SRC} strategy="lazyOnload" />
    </>
  )
}
