import { create } from 'zustand'

interface ToastItem {
  id: string
  type: 'error' | 'success' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number   // ms, default 5000
}

interface UIState {
  toasts: ToastItem[]
  isGlobalLoading: boolean
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  setGlobalLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  isGlobalLoading: false,

  addToast: (toast) => {
    const id = crypto.randomUUID()
    const duration = toast.duration ?? 5000

    set((state) => {
      const newToasts = [...state.toasts, { ...toast, id, duration }]
      if (newToasts.length > 5) {
        newToasts.shift()
      }
      return { toasts: newToasts }
    })

    setTimeout(() => {
      get().removeToast(id)
    }, duration)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  setGlobalLoading: (loading) => {
    set({ isGlobalLoading: loading })
  },
}))

export type { ToastItem }
