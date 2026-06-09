import { useLobbyStore } from '../stores/lobby.store'
import { useAuthStore } from '../stores/auth.store'
import { useUIStore } from '../stores/ui.store'
import { createSession, startSession } from '../api/sessions.api'
import { joinSession, leaveSession, generateInvite as generateInviteApi } from '../api/lobby.api'
import type { LobbySettings, SessionSummary, Lobby, Player, JoinGameRequest, GameStatus } from '../api/types'

export function useLobby(): {
  sessions: SessionSummary[]
  currentLobby: Lobby | null
  players: Player[]
  isLoading: boolean
  error: string | null
  fetchSessions: (params?: { status?: GameStatus; page?: number; size?: number }) => Promise<void>
  fetchLobby: (sessionId: string) => Promise<void>
  createLobby: (settings: LobbySettings) => Promise<Lobby>
  joinLobby: (sessionId: string, body: JoinGameRequest) => Promise<void>
  leaveLobby: (sessionId: string) => Promise<void>
  startGame: (sessionId: string) => Promise<void>
  generateInvite: (sessionId: string) => Promise<{ inviteToken: string; inviteUrl: string; expiresAt: string }>
} {
  const store = useLobbyStore()

  const handleLobbyError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unknown error'
    useUIStore.getState().addToast({ type: 'error', title: 'Fehler', message })
  }

  const createLobby = async (settings: LobbySettings): Promise<Lobby> => {
    try {
      const user = useAuthStore.getState().user
      if (!user) throw new Error('Nicht eingeloggt')
      const lobby = await createSession({ hostId: user.userId, settings })
      useLobbyStore.getState().setCurrentLobby(lobby)
      return lobby
    } catch (err) {
      handleLobbyError(err)
      throw err
    }
  }

  const joinLobby = async (sessionId: string, body: JoinGameRequest): Promise<void> => {
    try {
      const lobby = await joinSession(sessionId, body)
      useLobbyStore.getState().setCurrentLobby(lobby)
    } catch (err) {
      handleLobbyError(err)
      throw err
    }
  }

  const leaveLobby = async (sessionId: string): Promise<void> => {
    try {
      await leaveSession(sessionId)
      useLobbyStore.getState().reset()
    } catch (err) {
      handleLobbyError(err)
      throw err
    }
  }

  const startGame = async (sessionId: string): Promise<void> => {
    try {
      await startSession(sessionId)
    } catch (err) {
      handleLobbyError(err)
      throw err
    }
  }

  const generateInvite = async (sessionId: string): Promise<{ inviteToken: string; inviteUrl: string; expiresAt: string }> => {
    try {
      return await generateInviteApi(sessionId)
    } catch (err) {
      handleLobbyError(err)
      throw err
    }
  }

  return {
    sessions: store.sessions,
    currentLobby: store.currentLobby,
    players: store.players,
    isLoading: store.isLoading,
    error: store.error,
    fetchSessions: store.fetchSessions,
    fetchLobby: store.fetchLobby,
    createLobby,
    joinLobby,
    leaveLobby,
    startGame,
    generateInvite,
  }
}
