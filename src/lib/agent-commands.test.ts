import { handleAgentCommand, type AgentCommandDeps } from './agent-commands'

function makeEvent(detail: Record<string, unknown>) {
  const event = new CustomEvent('agent-command', { detail, cancelable: true, bubbles: true })
  return event
}

function makeDeps(): AgentCommandDeps {
  return {
    navigate: vi.fn(),
    getPageInfo: () => ({ pathname: '/movies/dune', title: 'Dune — DedCinema' }),
  }
}

describe('handleAgentCommand', () => {
  it('navigate на дозволений шлях: preventDefault + navigate', () => {
    const deps = makeDeps()
    const event = makeEvent({ type: 'navigate', payload: { path: '/movies/dune?x=1' } })
    handleAgentCommand(event, deps)
    expect(event.defaultPrevented).toBe(true)
    expect(deps.navigate).toHaveBeenCalledWith('/movies/dune')
  })

  it.each(['/account', '//evil.com', 'https://x', '/movies/../x'])(
    'navigate на %s: без preventDefault і без навігації',
    (path) => {
      const deps = makeDeps()
      const event = makeEvent({ type: 'navigate', payload: { path } })
      handleAgentCommand(event, deps)
      expect(event.defaultPrevented).toBe(false)
      expect(deps.navigate).not.toHaveBeenCalled()
    },
  )

  it('navigate без payload: не обробляється', () => {
    const deps = makeDeps()
    const event = makeEvent({ type: 'navigate' })
    handleAgentCommand(event, deps)
    expect(event.defaultPrevented).toBe(false)
  })

  it('page_context: preventDefault і respond з path, title, movieSlug', () => {
    const respond = vi.fn()
    const event = makeEvent({ type: 'page_context', payload: {}, respond })
    handleAgentCommand(event, makeDeps())
    expect(event.defaultPrevented).toBe(true)
    expect(respond).toHaveBeenCalledWith({
      path: '/movies/dune',
      title: 'Dune — DedCinema',
      movieSlug: 'dune',
    })
  })

  it('cart_state: preventDefault і порожній кошик', () => {
    const respond = vi.fn()
    const event = makeEvent({ type: 'cart_state', respond })
    handleAgentCommand(event, makeDeps())
    expect(event.defaultPrevented).toBe(true)
    expect(respond).toHaveBeenCalledWith({ seats: [], count: 0, total: 0 })
  })

  it('page_context без respond не кидає виняток', () => {
    const event = makeEvent({ type: 'page_context' })
    expect(() => handleAgentCommand(event, makeDeps())).not.toThrow()
    expect(event.defaultPrevented).toBe(true)
  })

  it('невідомий тип або сміття: не чіпає подію', () => {
    const deps = makeDeps()
    const unknown = makeEvent({ type: 'open_cart' })
    handleAgentCommand(unknown, deps)
    expect(unknown.defaultPrevented).toBe(false)
    const junk = new Event('agent-command', { cancelable: true })
    handleAgentCommand(junk, deps)
    expect(junk.defaultPrevented).toBe(false)
  })

  it('лог не містить payload', () => {
    const log = vi.fn()
    const deps = { ...makeDeps(), log }
    handleAgentCommand(makeEvent({ type: 'navigate', payload: { path: '/movies/dune' } }), deps)
    expect(log.mock.calls.flat().join(' ')).toBe('navigate handled')
  })
})
