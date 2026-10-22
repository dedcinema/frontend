import { normalizeAgentPath, parsePathContext } from './agent-paths'

export interface AgentCommandDeps {
  navigate: (path: string) => void
  getPageInfo: () => { pathname: string; title: string }
  log?: (message: string) => void
}

type Respond = (data: unknown) => void

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// preventDefault() = "сторінка обробила команду"; без нього агент припиняє спроби до кінця дзвінка
export function handleAgentCommand(event: Event, deps: AgentCommandDeps): void {
  const detail: unknown = (event as CustomEvent<unknown>).detail
  if (!isRecord(detail) || typeof detail.type !== 'string') return

  const respond: Respond | undefined =
    typeof detail.respond === 'function' ? (detail.respond as Respond) : undefined

  switch (detail.type) {
    case 'navigate': {
      const path = normalizeAgentPath(isRecord(detail.payload) ? detail.payload.path : undefined)
      if (!path) {
        deps.log?.('navigate blocked')
        return
      }
      event.preventDefault()
      deps.navigate(path)
      deps.log?.('navigate handled')
      return
    }
    case 'page_context': {
      event.preventDefault()
      const { pathname, title } = deps.getPageInfo()
      respond?.({ path: pathname, title, ...parsePathContext(pathname) })
      deps.log?.('page_context handled')
      return
    }
    case 'cart_state': {
      event.preventDefault()
      respond?.({ seats: [], count: 0, total: 0 })
      deps.log?.('cart_state handled')
      return
    }
    default:
      return
  }
}
