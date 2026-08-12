import { create } from 'zustand'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  studentId?: string | null
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
}

function loadStoredAuth(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  const token = localStorage.getItem('rsms_token')
  const userStr = localStorage.getItem('rsms_user')
  if (token && userStr) {
    try {
      return { user: JSON.parse(userStr) as AuthUser, token, isAuthenticated: true }
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
