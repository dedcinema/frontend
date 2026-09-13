import type { User } from '@/types/api'

export interface AuthStore {
  isAuthenticated: boolean
  user: User | null
  setUser: (user: User | null) => void
  setIsAuthenticated: (v: boolean) => void
  logout: () => void
}
