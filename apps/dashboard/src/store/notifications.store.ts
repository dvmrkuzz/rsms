import { create } from 'zustand'

export interface ToastNotification {
  id: string
  icon: 'visitor' | 'request'
  title: string
  message: string
  onClick?: () => void
}

interface NotificationState {
  toasts: ToastNotification[]
  push: (toast: Omit<ToastNotification, 'id'>) => void
  dismiss: (id: string) => void
}

let counter = 0
const TOAST_LIFETIME_MS = 7000

export const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],

  push: (toast) => {
    const id = `toast-${Date.now()}-${counter++}`
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, TOAST_LIFETIME_MS)
  },

  dismiss: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}))
