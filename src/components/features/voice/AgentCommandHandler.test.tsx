import { render } from '@testing-library/react'
import { AgentCommandHandler } from './AgentCommandHandler'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

function dispatch(detail: Record<string, unknown>) {
  const event = new CustomEvent('agent-command', { detail, cancelable: true, bubbles: true })
  document.dispatchEvent(event)
  return event
}

describe('AgentCommandHandler', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_HANC_AGENT_ID = 'agent-test'
    push.mockReset()
  })
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_HANC_AGENT_ID
  })

  it('navigate викликає router.push і підтверджує подію', () => {
    render(<AgentCommandHandler />)
    const event = dispatch({ type: 'navigate', payload: { path: '/movies' } })
    expect(push).toHaveBeenCalledWith('/movies')
    expect(event.defaultPrevented).toBe(true)
  })

  it('заборонений шлях ігнорується', () => {
    render(<AgentCommandHandler />)
    const event = dispatch({ type: 'navigate', payload: { path: '/account' } })
    expect(push).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('після unmount listener знято', () => {
    const { unmount } = render(<AgentCommandHandler />)
    unmount()
    dispatch({ type: 'navigate', payload: { path: '/movies' } })
    expect(push).not.toHaveBeenCalled()
  })

  it('без agent id listener не додається', () => {
    delete process.env.NEXT_PUBLIC_HANC_AGENT_ID
    render(<AgentCommandHandler />)
    dispatch({ type: 'navigate', payload: { path: '/movies' } })
    expect(push).not.toHaveBeenCalled()
  })
})
