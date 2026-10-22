import { render } from '@testing-library/react'
import { VoiceWidget } from './VoiceWidget'
import { linkVoiceCall } from '@/lib/voice-link'

vi.mock('next/script', () => ({ default: () => null }))
vi.mock('@/lib/voice-link', () => ({
  linkVoiceCall: vi.fn(),
  readVoiceIdentity: vi.fn(),
}))

const linkMock = vi.mocked(linkVoiceCall)

describe('VoiceWidget', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_HANC_AGENT_ID = 'agent-test'
    linkMock.mockReset()
    linkMock.mockResolvedValue(undefined)
  })
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_HANC_AGENT_ID
  })

  it('без agent id нічого не рендерить', () => {
    delete process.env.NEXT_PUBLIC_HANC_AGENT_ID
    const { container } = render(<VoiceWidget />)
    expect(container).toBeEmptyDOMElement()
  })

  it('call-start викликає linkVoiceCall один раз', () => {
    const { container } = render(<VoiceWidget />)
    const el = container.querySelector('hanc-ai-pill-floating-call')!
    el.dispatchEvent(new Event('call-start'))
    expect(linkMock).toHaveBeenCalledTimes(1)
  })

  it('повторний call-start під час виконання не дублює виклик', () => {
    linkMock.mockReturnValue(new Promise(() => {}))
    const { container } = render(<VoiceWidget />)
    const el = container.querySelector('hanc-ai-pill-floating-call')!
    el.dispatchEvent(new Event('call-start'))
    el.dispatchEvent(new Event('call-start'))
    expect(linkMock).toHaveBeenCalledTimes(1)
  })

  it('після unmount listener знято', () => {
    const { container, unmount } = render(<VoiceWidget />)
    const el = container.querySelector('hanc-ai-pill-floating-call')!
    unmount()
    el.dispatchEvent(new Event('call-start'))
    expect(linkMock).not.toHaveBeenCalled()
  })

  it('віджет не отримує токен чи дані користувача в атрибутах', () => {
    const { container } = render(<VoiceWidget />)
    const attrs = container.querySelector('hanc-ai-pill-floating-call')!.getAttributeNames()
    expect(attrs.some((a) => /token|user|identity|session/i.test(a))).toBe(false)
  })
})
