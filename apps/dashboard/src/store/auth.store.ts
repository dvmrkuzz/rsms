import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem('rsms_token', token)
    localStorage.setItem('rsms_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('rsms_token')
    localStorage.removeItem('rsms_user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

// Rehydrate from localStorage on app load
export const rehydrateAuth = () => {
  const token = localStorage.getItem('rsms_token')
  const userStr = localStorage.getItem('rsms_user')
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr) as User
      useAuthStore.getState().setAuth(user, token)
    } catch {
      useAuthStore.getState().clearAuth()
    }
  }
}