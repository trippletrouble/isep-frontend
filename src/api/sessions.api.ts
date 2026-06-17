import { api } from './client'
import type { GameState, Lobby, PaginatedSessionList, GameStatus, CreateSessionRequest } from './types'

export async function listSessions(params?: {
  status?: GameStatus
  page?: number
  size?: number
}): Promise<PaginatedSessionList> {
  const queryParts: string[] = []
  if (params) {
    if (params.status !== undefined) {
      queryParts.push(`status=${encodeURIComponent(params.status)}`)
    }
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

export async function getSession(id: string): Promise<GameState> {
  return api.get<GameState>(`/sessions/${id}`)
}

export async function deleteSession(id: string): Promise<void> {
  return api.delete<void>(`/sessions/${id}`)
}

export async function startSession(id: string): Promise<GameState> {
  return api.post<GameState>(`/sessions/${id}/start`)
}
