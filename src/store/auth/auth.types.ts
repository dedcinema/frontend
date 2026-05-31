import type { User } from '@/types/api'

export interface AuthStore {
  _hasHydrated: boolean
  isAuthenticated: boolean
  user: User | null
  setHasHydrated: (v: boolean) => void
  setUser: (user: User | null) => void
  setIsAuthenticated: (v: boolean) => void
  logout: () => void
}
