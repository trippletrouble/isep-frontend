import { api } from './client'
import type { Lobby, Player, LobbySettings, GameState, JoinGameRequest } from './types'

export async function getLobby(sessionId: string): Promise<Lobby> {
  return api.get<Lobby>(`/sessions/${sessionId}/lobby`)
}

export async function updateLobbySettings(sessionId: string, settings: LobbySettings): Promise<Lobby> {
  return api.put<Lobby>(`/sessions/${sessionId}/lobby`, settings)
}

export async function getPlayers(sessionId: string): Promise<Player[]> {
  return api.get<Player[]>(`/sessions/${sessionId}/players`)
}

export async function joinSession(sessionId: string, body: JoinGameRequest): Promise<Lobby> {
  return api.post<Lobby>(`/sessions/${sessionId}/join`, body)
}

export async function leaveSession(sessionId: string): Promise<GameState> {
  return api.delete<GameState>(`/sessions/${sessionId}/leave`)
}

export async function generateInvite(sessionId: string): Promise<{
  inviteToken: ***ENTFERNT***
  inviteUrl: string
  expiresAt: string
}> {
  return api.post<{
    inviteToken: ***ENTFERNT***
    inviteUrl: string
    expiresAt: string
  }>(`/sessions/${sessionId}/invite`)
}
