import { create } from 'zustand'
import { listSessions } from '../api/sessions.api'
import { getLobby, getSessionPlayers } from '../api/lobby.api'
import type { SessionSummary, Lobby, Player } from '../api/types'

interface LobbyState {
  sessions: SessionSummary[]
  currentLobby: Lobby | null
  players: Player[]
  isLoading: boolean
  error: string | null
  totalCount: number
  page: number

  fetchSessions: (params?: { page?: number; size?: number }) => Promise<void>
  fetchLobby: (sessionId: string) => Promise<void>
  fetchPlayers: (sessionId: string) => Promise<void>
  setCurrentLobby: (lobby: Lobby | null) => void
  updatePlayers: (players: Player[]) => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  sessions: [],
  currentLobby: null,
  players: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  page: 0,
}

export const useLobbyStore = create<LobbyState>((set) => ({
  ...initialState,

  fetchSessions: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const result = await listSessions(params)
      set({
        sessions: result.sessions,
        totalCount: result.totalCount,
        page: result.page,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchLobby: async (sessionId) => {
    set({ isLoading: true, error: null })
    try {
      const result = await getLobby(sessionId)
      set({
        currentLobby: result,
        players: result.players,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchPlayers: async (sessionId) => {
    set({ isLoading: true, error: null })
    try {
      const result = await getSessionPlayers(sessionId)
      set({ players: result })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  setCurrentLobby: (lobby) => {
    set({ currentLobby: lobby })
  },

  updatePlayers: (players) => {
    set({ players })
  },

  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    set(initialState)
  },
}))
