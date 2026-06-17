import { useLobbyStore } from '../stores/lobby.store'
import { useAuthStore } from '../stores/auth.store'
import { useUIStore } from '../stores/ui.store'
import { createSession, startSession } from '../api/sessions.api'
import { joinSession, leaveSession, generateInvite as generateInviteApi, updateLobbySettings as updateLobbySettingsApi } from '../api/lobby.api'
import { getErrorMessage } from '../lib/errorMessages'
import type { LobbySettings, SessionSummary, Lobby, Player, JoinGameRequest, GameStatus } from '../api/types'

export function useLobby(): {
  sessions: SessionSummary[]
  currentLobby: Lobby | null
  players: Player[]
  isLoading: boolean
  error: string | null
  totalCount: number
  page: number
  fetchSessions: (params?: { status?: GameStatus; page?: number; size?: number }) => Promise<void>
  fetchLobby: (sessionId: string) => Promise<void>
  createLobby: (settings: LobbySettings) => Promise<Lobby>
  joinLobby: (sessionId: string, body: JoinGameRequest) => Promise<Lobby>
  leaveLobby: (sessionId: string) => Promise<void>
  startGame: (sessionId: string) => Promise<void>
  generateInvite: (sessionId: string) => Promise<{ inviteToken: string; inviteUrl: string; expiresAt: string }>
  updateLobbySettings: (sessionId: string, settings: LobbySettings) => Promise<Lobby>
} {
  const store = useLobbyStore()

  const handleError = (err: unknown, title: string) => {
    useUIStore.getState().addToast({ type: 'error', title, message: getErrorMessage(err) })
  }

  const createLobby = async (settings: LobbySettings): Promise<Lobby> => {
    try {
      const user = useAuthStore.getState().user
      if (!user) throw new Error('Nicht eingeloggt')
      const lobby = await createSession({ hostId: user.userId, settings })
      useLobbyStore.getState().setCurrentLobby(lobby)
      return lobby
    } catch (err) {
      handleError(err, 'Lobby erstellen fehlgeschlagen')
      throw err
    }
  }

  const joinLobby = async (sessionId: string, body: JoinGameRequest): Promise<Lobby> => {
    try {
      const lobby = await joinSession(sessionId, body)
      useLobbyStore.getState().setCurrentLobby(lobby)
      return lobby
    } catch (err) {
      handleError(err, 'Beitreten fehlgeschlagen')
      throw err
    }
  }

  const leaveLobby = async (sessionId: string): Promise<void> => {
    try {
      await leaveSession(sessionId)
      useLobbyStore.getState().reset()
    } catch (err) {
      handleError(err, 'Verlassen fehlgeschlagen')
      throw err
    }
  }

  const startGame = async (sessionId: string): Promise<void> => {
    try {
      await startSession(sessionId)
    } catch (err) {
      handleError(err, 'Spiel starten fehlgeschlagen')
      throw err
    }
  }

  const generateInvite = async (sessionId: string): Promise<{ inviteToken: string; inviteUrl: string; expiresAt: string }> => {
    try {
      return await generateInviteApi(sessionId)
    } catch (err) {
      handleError(err, 'Einladungslink fehlgeschlagen')
      throw err
    }
  }

  const updateLobbySettings = async (sessionId: string, settings: LobbySettings): Promise<Lobby> => {
    try {
      const lobby = await updateLobbySettingsApi(sessionId, settings)
      useLobbyStore.getState().setCurrentLobby(lobby)
      useUIStore.getState().addToast({ type: 'success', title: 'Einstellungen gespeichert' })
      return lobby
    } catch (err) {
      handleError(err, 'Einstellungen speichern fehlgeschlagen')
      throw err
    }
  }

  return {
    sessions: store.sessions,
    currentLobby: store.currentLobby,
    players: store.players,
    isLoading: store.isLoading,
    error: store.error,
    totalCount: store.totalCount,
    page: store.page,
    fetchSessions: store.fetchSessions,
    fetchLobby: store.fetchLobby,
    createLobby,
    joinLobby,
    leaveLobby,
    startGame,
    generateInvite,
    updateLobbySettings,
  }
}
