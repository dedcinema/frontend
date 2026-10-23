import { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { api, instance } from './instance'
import { cookies } from '@/lib/cookies'
import { redirectTo } from '@/lib/redirect'

vi.mock('@/lib/redirect', () => ({ redirectTo: vi.fn() }))
const store = vi.hoisted(() => ({ token: 'old-token' }))
vi.mock('@/lib/cookies', () => ({
  cookies: {
    get: vi.fn(() => store.token),
    set: vi.fn((_key: string, value: string) => {
      store.token = value
    }),
    remove: vi.fn(),
  },
}))

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown }

function adapterFor(handler: Handler) {
  return vi.fn(async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const { status, data } = handler(config)
    const response = { data, status, statusText: '', headers: {}, config } as AxiosResponse
    if (status >= 400) throw new AxiosError('fail', String(status), config, null, response)
    return response
  })
}

const originalInstanceAdapter = instance.defaults.adapter
const originalApiAdapter = api.defaults.adapter

describe('axios instances', () => {
  beforeEach(() => {
    vi.mocked(redirectTo).mockReset()
    vi.mocked(cookies.set).mockClear()
    vi.mocked(cookies.remove).mockClear()
    store.token = 'old-token'
  })
  afterEach(() => {
    instance.defaults.adapter = originalInstanceAdapter
    api.defaults.adapter = originalApiAdapter
  })

  it('обидва інстанси надсилають credentials', () => {
    expect(api.defaults.withCredentials).toBe(true)
    expect(instance.defaults.withCredentials).toBe(true)
  })

  it('успішний refresh повторює запит з новим токеном без редіректу', async () => {
    const seen: Array<string | undefined> = []
    instance.defaults.adapter = adapterFor((config) => {
      const auth = String(config.headers.Authorization)
      seen.push(auth)
      return auth === 'Bearer new-token' ? { status: 200, data: 'ok' } : { status: 401 }
    })
    const refresh = adapterFor(() => ({ status: 200, data: { accessToken: 'new-token' } }))
    api.defaults.adapter = refresh

    const res = await instance.get('/profile')

    expect(res.data).toBe('ok')
    expect(seen).toEqual(['Bearer old-token', 'Bearer new-token'])
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(cookies.set).toHaveBeenCalledWith('accessToken', 'new-token')
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('невдалий refresh видаляє cookie і веде на логін', async () => {
    instance.defaults.adapter = adapterFor(() => ({ status: 401 }))
    api.defaults.adapter = adapterFor(() => ({ status: 401 }))

    await expect(instance.get('/profile')).rejects.toBeTruthy()

    expect(cookies.remove).toHaveBeenCalledWith('accessToken')
    expect(redirectTo).toHaveBeenCalledTimes(1)
    expect(redirectTo).toHaveBeenCalledWith('/auth/login')
  })

  it.each([403, 404, 500])('статус %s не запускає refresh', async (status) => {
    instance.defaults.adapter = adapterFor(() => ({ status }))
    const refresh = adapterFor(() => ({ status: 200, data: { accessToken: 'x' } }))
    api.defaults.adapter = refresh

    await expect(instance.get('/profile')).rejects.toBeTruthy()

    expect(refresh).not.toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
  })
})
