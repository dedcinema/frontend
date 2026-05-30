import { useMutation } from '@tanstack/react-query'
import { authApi, type AuthResponse } from '../requests/auth'
import { useAuthStore } from '@/store/auth/auth.store'
import { cookies } from '@/lib/cookies'

export function useAuth() {
  const { isAuthenticated, user, setUser, setIsAuthenticated, logout } = useAuthStore()

  function auth(data: AuthResponse) {
    cookies.set('accessToken', data.accessToken)
    setUser(data.user)
    setIsAuthenticated(true)
  }

  function exit() {
    authApi.logout().catch(() => {})
    cookies.remove('accessToken')
    logout()
  }

  const sendOtp = useMutation({ mutationFn: authApi.sendOtp })

  const verifyOtp = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => auth(data),
  })

  return { isAuthenticated, user, auth, exit, sendOtp, verifyOtp }
}
