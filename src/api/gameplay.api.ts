import { api } from './client'
import type { DiceRollResult, MoveResult, MoveRequest, PossibleMove, GameResults, GameHistoryEvent } from './types'

export async function rollDice(sessionId: string): Promise<DiceRollResult> {
  return api.post<DiceRollResult>(`/sessions/${sessionId}/rolls`)
}

export async function createMove(sessionId: string, body: MoveRequest): Promise<MoveResult> {
  return api.post<MoveResult>(`/sessions/${sessionId}/moves`, body)
}

export async function getPossibleMoves(
  sessionId: string
): Promise<{ diceValue: number; possibleMoves: PossibleMove[] }> {
  return api.get<{ diceValue: number; possibleMoves: PossibleMove[] }>(
    `/sessions/${sessionId}/possible-moves`
  )
}

export async function getSessionResults(sessionId: string): Promise<GameResults[]> {
  return api.get<GameResults[]>(`/sessions/${sessionId}/results`)
}

export async function getSessionHistory(sessionId: string): Promise<GameHistoryEvent[]> {
  return api.get<GameHistoryEvent[]>(`/sessions/${sessionId}/history`)
}
