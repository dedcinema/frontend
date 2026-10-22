import { linkVoiceCall, readVoiceIdentity, type VoiceLinkDeps } from './voice-link'

const httpError = (status: number) => Object.assign(new Error(`http ${status}`), { response: { status } })

function makeDeps(overrides: Partial<VoiceLinkDeps> = {}): VoiceLinkDeps {
  return {
    isAuthenticated: () => true,
    getToken: () => 'token',
    readIdentity: () => 'identity-uuid',
    link: vi.fn().mockResolvedValue({ linked: true, expiresInSeconds: 600 }),
    wait: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('linkVoiceCall', () => {
  it('логаут: нічого не викликає', async () => {
    const deps = makeDeps({ isAuthenticated: () => false })
    await linkVoiceCall(deps)
    expect(deps.link).not.toHaveBeenCalled()
  })

  it('залогінений, але без токена в cookie: нічого не викликає', async () => {
    const deps = makeDeps({ getToken: () => undefined })
    await linkVoiceCall(deps)
    expect(deps.link).not.toHaveBeenCalled()
  })

  it('успіх: один виклик link з identity і токеном', async () => {
    const deps = makeDeps()
    await linkVoiceCall(deps)
    expect(deps.link).toHaveBeenCalledTimes(1)
    expect(deps.link).toHaveBeenCalledWith('identity-uuid', 'token')
  })

  it('identity з’являється після 2 с: один повтор читання, потім виклик', async () => {
    const readIdentity = vi.fn().mockReturnValueOnce(null).mockReturnValueOnce('late-uuid')
    const deps = makeDeps({ readIdentity })
    await linkVoiceCall(deps)
    expect(deps.wait).toHaveBeenCalledWith(2000)
    expect(deps.link).toHaveBeenCalledWith('late-uuid', 'token')
  })

  it('identity відсутня і після повтору: link не викликається', async () => {
    const deps = makeDeps({ readIdentity: () => null })
    await linkVoiceCall(deps)
    expect(deps.wait).toHaveBeenCalledTimes(1)
    expect(deps.link).not.toHaveBeenCalled()
  })

  it.each([401, 400, 429])('HTTP %i: без повтору і без винятку', async (status) => {
    const deps = makeDeps({ link: vi.fn().mockRejectedValue(httpError(status)) })
    await expect(linkVoiceCall(deps)).resolves.toBeUndefined()
    expect(deps.link).toHaveBeenCalledTimes(1)
  })

  it('мережева помилка: один повтор через 2 с, потім успіх', async () => {
    const link = vi.fn().mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce({})
    const deps = makeDeps({ link })
    await linkVoiceCall(deps)
    expect(link).toHaveBeenCalledTimes(2)
    expect(deps.wait).toHaveBeenCalledWith(2000)
  })

  it('мережева помилка двічі: рівно 2 спроби, без винятку', async () => {
    const deps = makeDeps({ link: vi.fn().mockRejectedValue(new Error('Network Error')) })
    await expect(linkVoiceCall(deps)).resolves.toBeUndefined()
    expect(deps.link).toHaveBeenCalledTimes(2)
  })

  it('скасування під час очікування: повтор не виконується', async () => {
    const deps = makeDeps({
      link: vi.fn().mockRejectedValue(new Error('Network Error')),
      isCancelled: () => true,
    })
    await linkVoiceCall(deps)
    expect(deps.link).toHaveBeenCalledTimes(1)
  })

  it('лог містить лише статус/тип помилки, без токена та identity', async () => {
    const log = vi.fn()
    await linkVoiceCall(makeDeps({ link: vi.fn().mockRejectedValue(httpError(429)), log }))
    await linkVoiceCall(makeDeps({ log }))
    const logged = log.mock.calls.map((c) => c[0]).join(' ')
    expect(logged).toBe('http 429 linked')
    expect(logged).not.toContain('token')
    expect(logged).not.toContain('identity-uuid')
  })
})

describe('readVoiceIdentity', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('читає user_identity', () => {
    localStorage.setItem('user_identity', ' abc ')
    expect(readVoiceIdentity()).toBe('abc')
  })
  it('немає значення → null', () => {
    expect(readVoiceIdentity()).toBeNull()
  })
  it('помилка сховища → null без винятку', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(readVoiceIdentity()).toBeNull()
  })
})
