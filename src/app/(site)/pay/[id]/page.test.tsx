import { act, fireEvent, render, screen } from '@testing-library/react'
import { AxiosError } from 'axios'
import PayPage from './page'
import { paymentApi } from '@/api/requests/payment'
import { redirectTo } from '@/lib/redirect'
import { useAuthStore } from '@/store/auth/auth.store'

vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'pay_1' }) }))
vi.mock('@/api/requests/payment', () => ({ paymentApi: { link: vi.fn() } }))
vi.mock('@/lib/redirect', () => ({ redirectTo: vi.fn() }))

const STRIPE_URL = 'https://checkout.stripe.com/c/pay/cs_test_secret'
const link = vi.mocked(paymentApi.link)

function httpError(status: number) {
  const error = new AxiosError('fail')
  error.response = { status } as AxiosError['response']
  return error
}

async function renderPage() {
  render(<PayPage />)
  await act(async () => {})
}

describe('PayPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    link.mockReset()
    vi.mocked(redirectTo).mockReset()
    useAuthStore.setState({ isAuthenticated: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('без входу показує повідомлення і не робить запит', async () => {
    useAuthStore.setState({ isAuthenticated: false })
    await renderPage()
    expect(screen.getByText('Увійдіть в акаунт, щоб перейти до оплати')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Увійти' }).getAttribute('href')).toBe('/auth/login')
    expect(link).not.toHaveBeenCalled()
  })

  it('редіректить один раз рівно через 3 с і не показує url', async () => {
    link.mockResolvedValue({ url: STRIPE_URL })
    await renderPage()
    expect(link).toHaveBeenCalledTimes(1)
    expect(link).toHaveBeenCalledWith('pay_1')
    expect(document.body.innerHTML).not.toContain('cs_test_secret')

    act(() => vi.advanceTimersByTime(2999))
    expect(redirectTo).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(redirectTo).toHaveBeenCalledTimes(1)
    expect(redirectTo).toHaveBeenCalledWith(STRIPE_URL)

    act(() => vi.advanceTimersByTime(10000))
    expect(redirectTo).toHaveBeenCalledTimes(1)
  })

  it('кнопка веде одразу, таймер потім не дублює редірект', async () => {
    link.mockResolvedValue({ url: STRIPE_URL })
    await renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Перейти до оплати' }))
    expect(redirectTo).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(5000))
    expect(redirectTo).toHaveBeenCalledTimes(1)
  })

  it('таймер скасовується при розмонтуванні', async () => {
    link.mockResolvedValue({ url: STRIPE_URL })
    const { unmount } = render(<PayPage />)
    await act(async () => {})
    unmount()
    act(() => vi.advanceTimersByTime(5000))
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it.each([
    [404, 'Платіж не знайдено'],
    [409, 'Оплату вже завершено або посилання застаріло. Перевірте розділ «Мої квитки» або оформіть бронювання ще раз'],
    [429, 'Забагато спроб, спробуйте пізніше'],
  ])('статус %s показує повідомлення і посилання на головну', async (status, message) => {
    link.mockRejectedValue(httpError(status))
    await renderPage()
    expect(screen.getByRole('alert').textContent).toBe(message)
    expect(screen.getByRole('link', { name: 'На головну' }).getAttribute('href')).toBe('/')
    act(() => vi.advanceTimersByTime(5000))
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('мережева помилка показує загальне повідомлення', async () => {
    link.mockRejectedValue(new AxiosError('Network Error'))
    await renderPage()
    expect(screen.getByRole('alert').textContent).toBe('Не вдалося отримати посилання, спробуйте ще раз')
  })

  it.each(['https://evil.com/x', 'http://checkout.stripe.com/x'])(
    'чужий url %s дає загальну помилку без редіректу',
    async (url) => {
      link.mockResolvedValue({ url })
      await renderPage()
      expect(screen.getByRole('alert').textContent).toBe('Не вдалося отримати посилання, спробуйте ще раз')
      act(() => vi.advanceTimersByTime(5000))
      expect(redirectTo).not.toHaveBeenCalled()
    },
  )
})
