const IDENTITY_KEY = 'user_identity'
const RETRY_DELAY_MS = 2000

export interface VoiceLinkDeps {
  isAuthenticated: () => boolean
  getToken: () => string | undefined
  readIdentity: () => string | null
  link: (identity: string, token: string) => Promise<unknown>
  wait: (ms: number) => Promise<void>
  isCancelled?: () => boolean
  log?: (message: string) => void
}

export function readVoiceIdentity(): string | null {
  try {
    const value = localStorage.getItem(IDENTITY_KEY)?.trim()
    return value ? value : null
  } catch {
    return null
  }
}

function getHttpStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null || !('response' in err)) return undefined
  const response = (err as { response?: { status?: unknown } }).response
  return typeof response?.status === 'number' ? response.status : undefined
}

export async function linkVoiceCall(deps: VoiceLinkDeps): Promise<void> {
  const { isAuthenticated, getToken, readIdentity, link, wait, isCancelled, log } = deps
  const cancelled = () => isCancelled?.() === true

  if (!isAuthenticated()) return
  const token = getToken()
  if (!token) return

  let identity = readIdentity()
  if (!identity) {
    await wait(RETRY_DELAY_MS)
    if (cancelled()) return
    identity = readIdentity()
    if (!identity) {
      log?.('identity missing')
      return
    }
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await link(identity, token)
      log?.('linked')
      return
    } catch (err) {
      const status = getHttpStatus(err)
      if (status !== undefined) {
        log?.(`http ${status}`)
        return
      }
      log?.('network error')
      if (attempt === 1) return
      await wait(RETRY_DELAY_MS)
      if (cancelled()) return
    }
  }
}
