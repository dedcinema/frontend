import Cookies from 'js-cookie'
import { cookies } from './cookies'

vi.mock('js-cookie', () => ({ default: { get: vi.fn(), set: vi.fn(), remove: vi.fn() } }))

describe('cookies.set', () => {
  it('додає sameSite lax за замовчуванням', () => {
    cookies.set('accessToken', 'x')
    expect(Cookies.set).toHaveBeenCalledWith('accessToken', 'x', expect.objectContaining({ sameSite: 'lax' }))
  })

  it('не перетирає явні опції', () => {
    cookies.set('k', 'v', { sameSite: 'strict' })
    expect(Cookies.set).toHaveBeenLastCalledWith('k', 'v', expect.objectContaining({ sameSite: 'strict' }))
  })
})
