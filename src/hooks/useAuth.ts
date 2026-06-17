import { useAuthStore } from '../stores/auth.store'
import { useGameStore } from '../stores/game.store'
import { useLobbyStore } from '../stores/lobby.store'
import { getOAuthUrl } from '../api/auth.api'
import { useUIStore } from '../stores/ui.store'
import type { SessionUser } from '../api/types'

export function useAuth(): {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  checkSession: () => Promise<void>
  logout: () => Promise<void>
  loginUrl: string
} {
  const store = useAuthStore()
  const loginUrl = getOAuthUrl()

  const logout = async () => {
    await useAuthStore.getState().logout()
    useLobbyStore.getState().reset()
    useGameStore.getState().reset()
    useUIStore.getState().addToast({ type: 'success', title: 'Abgemeldet' })
    window.location.href = '/login'
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    checkSession: store.checkSession,
    logout,
    loginUrl,
  }
}
