import axios from 'axios'
import { cookies } from '@/lib/cookies'
import { ROUTES } from '@/constants/routes'

export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

export const instance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

instance.interceptors.request.use((config) => {
  const token = cookies.get('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = []

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status !== 401) return Promise.reject(error)

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        error.config.headers.Authorization = `Bearer ${token}`
        return instance(error.config)
      })
    }

    isRefreshing = true
    try {
      const { data } = await api.post<{ accessToken: string }>('/auth/refresh')
      cookies.set('accessToken', data.accessToken)
      failedQueue.forEach((p) => p.resolve(data.accessToken))
      failedQueue = []
      error.config.headers.Authorization = `Bearer ${data.accessToken}`
      return instance(error.config)
    } catch (err) {
      failedQueue.forEach((p) => p.reject(err))
      failedQueue = []
      cookies.remove('accessToken')
      window.location.href = ROUTES.AUTH.LOGIN
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)
