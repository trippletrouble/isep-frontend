import { api } from './client'
import type { Lobby, Player, LobbySettings, GameState, JoinSessionRequest } from './types'

export async function getLobby(sessionId: string): Promise<Lobby> {
  return api.get<Lobby>(`/sessions/${sessionId}/lobby`)
}

export async function updateLobbySettings(sessionId: string, settings: LobbySettings): Promise<LobbySettings> {
  return api.put<LobbySettings>(`/sessions/${sessionId}/lobby`, settings)
}

export async function getSessionPlayers(sessionId: string): Promise<Player[]> {
  return api.get<Player[]>(`/sessions/${sessionId}/players`)
}

export async function joinSession(
  sessionId: string,
  body?: JoinSessionRequest,
  inviteToken?: string
): Promise<GameState> {
  const query = inviteToken ? `?inviteToken=${encodeURIComponent(inviteToken)}` : ''
  return api.post<GameState>(`/sessions/${sessionId}/join${query}`, body)
}

export async function leaveSession(sessionId: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/sessions/${sessionId}/leave`)
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
