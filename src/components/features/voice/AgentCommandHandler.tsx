'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { handleAgentCommand } from '@/lib/agent-commands'

const debugLog = (message: string) => {
  if (process.env.NEXT_PUBLIC_VOICE_LINK_DEBUG === 'true') {
    console.debug(`[agent-command] ${message}`)
  }
}

export function AgentCommandHandler() {
  const router = useRouter()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_HANC_AGENT_ID) return

    const onCommand = (event: Event) =>
      handleAgentCommand(event, {
        navigate: (path) => router.push(path),
        getPageInfo: () => ({ pathname: window.location.pathname, title: document.title }),
        log: debugLog,
      })

    document.addEventListener('agent-command', onCommand)
    return () => document.removeEventListener('agent-command', onCommand)
  }, [router])

  return null
}
