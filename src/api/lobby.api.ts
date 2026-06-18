import { api } from './client'
import { normalizeLobby, normalizeGameState } from './normalizers'
import type { Lobby, Player, LobbySettings, GameState, JoinSessionRequest } from './types'

export async function getLobby(sessionId: string): Promise<Lobby> {
  const raw = await api.get<any>(`/sessions/${sessionId}/lobby`)
  return normalizeLobby(raw)
}

export async function updateLobbySettings(sessionId: string, settings: LobbySettings): Promise<LobbySettings> {
  return api.put<LobbySettings>(`/sessions/${sessionId}/lobby`, settings)
}

export async function getSessionPlayers(sessionId: string): Promise<Player[]> {
  const raw = await api.get<any[]>(`/sessions/${sessionId}/players`)
  // PlayerResponseDto hat userId (user ID), id (participant ID)
  return (raw ?? []).map((p: any) => ({
    id: p.userId ?? p.id,
    username: p.username ?? '',
    color: p.color,
    type: p.type ?? 'HUMAN',
    isCurrentTurn: p.isCurrentTurn ?? false,
    hasFinished: p.hasFinished ?? false,
    figuresInGoal: p.figuresInGoal ?? 0,
  }))
}

export async function joinSession(
  sessionId: string,
  body?: JoinSessionRequest,
  inviteToken?: string,
): Promise<GameState> {
  const query = inviteToken ? `?inviteToken=${encodeURIComponent(inviteToken)}` : ''
  const raw = await api.post<any>(`/sessions/${sessionId}/join${query}`, body)
  return normalizeGameState(raw)
}

export async function leaveSession(sessionId: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/sessions/${sessionId}/leave`)
}

export async function generateInvite(sessionId: string): Promise<{
  inviteToken: ***ENTFERNT***
  inviteUrl: string
  expiresAt: string
}> {
  // generateInvite ist der EINZIGE Endpoint der manuell { status, data } zurückgibt
  // client.ts erkennt das und gibt bereits data zurück
  return api.post<{ inviteToken: string; inviteUrl: string; expiresAt: string }>(
    `/sessions/${sessionId}/invite`,
  )
}
