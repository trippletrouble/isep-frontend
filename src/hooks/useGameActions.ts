import { useState } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { useGameStore } from '../stores/game.store'
import { useUIStore } from '../stores/ui.store'
import { rollDice as rollDiceApi, moveFigure as moveFigureApi } from '../api/gameplay.api'
import { getErrorMessage } from '../lib/errorMessages'

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
      const result = await rollDiceApi(sessionId, user.userId)
      useGameStore.getState().setDiceResult(result)

      if (result.turnForfeit) {
        useUIStore.getState().addToast({ type: 'warning', title: '3× Sechs!', message: 'Zug verfällt – nächster Spieler ist dran.' })
      } else if (result.rollAgain) {
        useUIStore.getState().addToast({ type: 'info', title: 'Nochmal würfeln!', message: 'Du hast eine 6 gewürfelt.' })
      } else if (!result.hasMoves) {
        useUIStore.getState().addToast({ type: 'info', title: 'Kein Zug möglich', message: 'Runde wird automatisch weitergegeben.' })
      }
    } catch (err: unknown) {
      useUIStore.getState().addToast({ type: 'error', title: 'Würfeln fehlgeschlagen', message: getErrorMessage(err) })
    } finally {
      setIsRolling(false)
    }
  }

  const moveFigure = async (sessionId: string, figureId: number, targetFieldId: number): Promise<void> => {
    const user = useAuthStore.getState().user
    if (!user) return
    try {
      setIsMoving(true)
      const result = await moveFigureApi(sessionId, { playerId: user.userId, figureId, targetFieldId })
      useGameStore.getState().setMoveResult(result)
    } catch (err: unknown) {
      useUIStore.getState().addToast({ type: 'error', title: 'Zug fehlgeschlagen', message: getErrorMessage(err) })
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
