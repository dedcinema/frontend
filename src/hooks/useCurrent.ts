import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { usersApi } from '@/api/requests/users'
import { cookies } from '@/lib/cookies'
import { useAuthStore } from '@/store/auth/auth.store'

export function useCurrent() {
  const { setUser, setIsAuthenticated, logout } = useAuthStore()
  const token = cookies.get('accessToken')

  const { data, error } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.me,
    enabled: !!token,
    retry: false,
  })

  useEffect(() => {
    if (!data) return
    setUser(data)
    setIsAuthenticated(true)
  }, [data, setUser, setIsAuthenticated])

  useEffect(() => {
    if (!error) return
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      logout()
      cookies.remove('accessToken')
    }
  }, [error, logout])
}
