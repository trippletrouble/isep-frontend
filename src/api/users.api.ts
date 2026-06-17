import { api } from './client'
import type { PlayerProfile, PlayerStats } from './types'

export async function getUserProfile(userId: string): Promise<PlayerProfile> {
  return api.get<PlayerProfile>(`/users/${userId}`)
}

export async function getUserStats(userId: string): Promise<PlayerStats> {
  return api.get<PlayerStats>(`/users/${userId}/stats`)
}
