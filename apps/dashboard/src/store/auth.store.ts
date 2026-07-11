import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

function loadStoredAuth(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  const token = localStorage.getItem('rsms_token')
  const userStr = localStorage.getItem('rsms_user')
  if (token && userStr) {
    try {
      return { user: JSON.parse(userStr) as User, token, isAuthenticated: true }
    } catch {
      localStorage.removeItem('rsms_token')
      localStorage.removeItem('rsms_user')
    }
  }
  return { user: null, token: null, isAuthenticated: false }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadStoredAuth(),

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