import { api, API_BASE_URL } from './client'
import type { SessionUser } from './types'

export async function getSession(): Promise<SessionUser> {
  return api.get<SessionUser>('/auth/session')
}

export async function logout(): Promise<void> {
  return api.post<void>('/auth/logout')
}

export function getOAuthUrl(): string {
  return API_BASE_URL + '/auth/oauth'
}
