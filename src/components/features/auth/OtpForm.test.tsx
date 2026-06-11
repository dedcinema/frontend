import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { OtpForm } from './OtpForm'

const { mockSendOtp, mockVerifyOtp } = vi.hoisted(() => ({
  mockSendOtp: { mutateAsync: vi.fn(), isPending: false },
  mockVerifyOtp: { mutateAsync: vi.fn(), isPending: false },
}))

vi.mock('@/api/hooks', () => ({
  useAuth: () => ({ sendOtp: mockSendOtp, verifyOtp: mockVerifyOtp }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('@/api/requests', () => ({
  authApi: { getTelegramUrl: vi.fn() },
}))

describe('OtpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendOtp.mutateAsync.mockResolvedValue(undefined)
    mockVerifyOtp.mutateAsync.mockResolvedValue(undefined)
  })

  it('рендерить поле email/телефон на кроці send', () => {
    render(<OtpForm />)
    expect(screen.getByLabelText('Email або телефон')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отримати код' })).toBeInTheDocument()
  })

  it('ввід email + клік → викликає sendOtp з правильними даними', async () => {
    const user = userEvent.setup()
    render(<OtpForm />)

    await user.type(screen.getByLabelText('Email або телефон'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Отримати код' }))

    await waitFor(() => {
      expect(mockSendOtp.mutateAsync).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        type: 'email',
      })
    })
  })

  it('після успішного sendOtp → перемикає на крок verify', async () => {
    const user = userEvent.setup()
    render(<OtpForm />)

    await user.type(screen.getByLabelText('Email або телефон'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Отримати код' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Код підтвердження')).toBeInTheDocument()
    })
  })

  it('на кроці verify ввід коду + клік → викликає verifyOtp', async () => {
    const user = userEvent.setup()
    render(<OtpForm />)

    await user.type(screen.getByLabelText('Email або телефон'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Отримати код' }))

    await waitFor(() => screen.getByLabelText('Код підтвердження'))
    await user.type(screen.getByLabelText('Код підтвердження'), '123456')
    await user.click(screen.getByRole('button', { name: 'Увійти' }))

    await waitFor(() => {
      expect(mockVerifyOtp.mutateAsync).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        code: '123456',
        type: 'email',
      })
    })
  })

  it('помилка sendOtp → показує toast.error', async () => {
    mockSendOtp.mutateAsync.mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    render(<OtpForm />)

    await user.type(screen.getByLabelText('Email або телефон'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Отримати код' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не вдалося надіслати код. Спробуйте ще раз.')
    })
  })
})
