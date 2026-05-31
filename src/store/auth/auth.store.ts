import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthStore } from './auth.types'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setUser: (user) => set({ user }),
      setIsAuthenticated: (v) => set({ isAuthenticated: v }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
