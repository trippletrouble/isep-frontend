import { useState } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { useGameStore } from '../stores/game.store'
import { useUIStore } from '../stores/ui.store'
import { rollDice as rollDiceApi, createMove } from '../api/gameplay.api'

export function useGameActions(): {
  rollDice: (sessionId: string) => Promise<void>
  moveFigure: (sessionId: string, figureId: number, targetFieldId: number) => Promise<void>
  isRolling: boolean
  isMoving: boolean
} {
  const [isRolling, setIsRolling] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  const rollDice = async (sessionId: string): Promise<void> => {
    const user = useAuthStore.getState().user
    if (!user) return
    try {
      setIsRolling(true)
      const result = await rollDiceApi(sessionId)
      useGameStore.getState().setDiceResult(result)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Würfeln fehlgeschlagen'
      useUIStore.getState().addToast({ type: 'error', title: 'Würfeln fehlgeschlagen', message })
    } finally {
      setIsRolling(false)
    }
  }

  const moveFigure = async (sessionId: string, figureId: number, targetFieldId: number): Promise<void> => {
    const user = useAuthStore.getState().user
    if (!user) return
    try {
      setIsMoving(true)
      const result = await createMove(sessionId, { figureId, toPosition: targetFieldId })
      useGameStore.getState().setMoveResult(result)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Zug fehlgeschlagen'
      useUIStore.getState().addToast({ type: 'error', title: 'Zug fehlgeschlagen', message })
    } finally {
      setIsMoving(false)
    }
  }

  return {
    rollDice,
    moveFigure,
    isRolling,
    isMoving,
  }
}
