import { useState } from 'react'
import { Dice } from './Dice'
import { DiceButton } from './DiceButton'
import { useGameActions } from '@/hooks/useGameActions'
import { useGameStore } from '@/stores/game.store'
import { useAuthStore } from '@/stores/auth.store'

interface DicePanelProps {
  sessionId: string
  className?: string
}

export function DicePanel({ sessionId, className }: DicePanelProps) {
  const { rollDice, isRolling } = useGameActions()
  const { lastDiceValue, diceRolledThisTurn, currentPlayerId, status } = useGameStore()
  const { user } = useAuthStore()
  const [fakeRoll, setFakeRoll] = useState<number | null>(null)

  const isMyTurn = currentPlayerId === user?.userId
  const canRoll = isMyTurn && !diceRolledThisTurn && status === 'IN_PROGRESS' && !isRolling

  const displayValue = isRolling && fakeRoll !== null ? fakeRoll : (lastDiceValue ?? 1)

  const handleRollClick = async () => {
    if (!canRoll) return

    // Animate first, API call runs in parallel
    const shuffleTimings = [150, 400]
    shuffleTimings.forEach((ms) => {
      setTimeout(() => setFakeRoll(Math.floor(Math.random() * 6) + 1), ms)
    })

    await rollDice(sessionId)
    setFakeRoll(null)
  }

  return (
    <div
      className={`bg-primary border border-accent hover:border-white rounded-2xl lg:rounded-4xl p-4 lg:p-8 flex flex-col gap-4 md:gap-6 items-center justify-center w-full h-full lg:h-auto mx-auto shrink-0 min-w-0 transition-all duration-700 ease-[cubic-bezier(0.5,1.5,0.4,1)] ${className}`}
    >
      <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl text-white font-lilita uppercase tracking-[0.02em]">
        Würfel
      </h2>

      <Dice value={displayValue} isRolling={isRolling} />

      {!isMyTurn && status === 'IN_PROGRESS' && (
        <p className="text-[#ACACAC] text-xs font-afacad text-center">Anderer Spieler ist dran</p>
      )}

      <DiceButton onClick={handleRollClick} disabled={!canRoll} />
    </div>
  )
}
