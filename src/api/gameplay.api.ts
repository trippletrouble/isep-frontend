import { api } from './client'
import type { DiceRollResult, MoveResult, MoveRequest, PossibleMove, GameResults, GameHistoryEvent } from './types'

export async function rollDice(sessionId: string, playerId: string): Promise<DiceRollResult> {
  return api.post<DiceRollResult>(`/sessions/${sessionId}/rolls`, { playerId })
}

export async function moveFigure(sessionId: string, body: MoveRequest): Promise<MoveResult> {
  return api.post<MoveResult>(`/sessions/${sessionId}/moves`, body)
}

export async function getPossibleMoves(
  sessionId: string,
  playerId: string
): Promise<{ diceValue: number; possibleMoves: PossibleMove[] }> {
  return api.get<{ diceValue: number; possibleMoves: PossibleMove[] }>(
    `/sessions/${sessionId}/possible-moves?playerId=${encodeURIComponent(playerId)}`
  )
}

export async function getResults(sessionId: string): Promise<GameResults> {
  return api.get<GameResults>(`/sessions/${sessionId}/results`)
}

export async function getHistory(sessionId: string): Promise<GameHistoryEvent[]> {
  return api.get<GameHistoryEvent[]>(`/sessions/${sessionId}/history`)
}
