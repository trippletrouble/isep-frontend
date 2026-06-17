import { api } from './client'
import type { GameState, Lobby, PaginatedSessionList, CreateSessionRequest, StartSessionResult } from './types'

export async function listSessions(params?: {
  page?: number
  size?: number
}): Promise<PaginatedSessionList> {
  const queryParts: string[] = []
  if (params) {
    if (params.page !== undefined) {
      queryParts.push(`page=${encodeURIComponent(params.page)}`)
    }
    if (params.size !== undefined) {
      queryParts.push(`size=${encodeURIComponent(params.size)}`)
    }
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
  return api.get<PaginatedSessionList>(`/sessions${queryString}`)
}

export async function createSession(body: CreateSessionRequest): Promise<Lobby> {
  return api.post<Lobby>('/sessions', body)
}

export async function getSessionState(id: string): Promise<GameState> {
  return api.get<GameState>(`/sessions/${id}`)
}

export async function deleteSession(id: string): Promise<void> {
  return api.delete<void>(`/sessions/${id}`)
}

export async function startSession(id: string): Promise<StartSessionResult> {
  return api.post<StartSessionResult>(`/sessions/${id}/start`)
}

export async function reconnectSession(id: string): Promise<void> {
  return api.post<void>(`/sessions/${id}/reconnect`)
}
