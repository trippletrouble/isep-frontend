import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useLobby } from '@/hooks/useLobby'
import type { AdditionalRule } from '@/api/types'

export function CreateLobbyCard() {
  const navigate = useNavigate()
  const { createLobby } = useLobby()
  const [playerCount, setPlayerCount] = useState<number>(4)
  const [isLoading, setIsLoading] = useState(false)

  async function handleCreate() {
    if (isLoading) return
    setIsLoading(true)
    try {
      const lobby = await createLobby({
        numberOfPlayers: playerCount,
        mode: 'CLASSIC',
        boardTheme: 'CLASSIC',
        isPrivate: false,
        turnTimeLimitSeconds: null,
        additionalRules: ['THROW_AGAIN_ON_6'] as AdditionalRule[],
      })
      navigate('/game/' + lobby.sessionId)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 rounded-[40px] border border-accent bg-primary p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex flex-col gap-6">
      <span className="font-bold text-white text-[40px] uppercase tracking-[2%]">
        Lobby erstellen
      </span>
      <div className="flex flex-col gap-4 flex-1">
        <select
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
          className="bg-primary border border-accent text-white h-12 rounded-xl px-4 w-full"
        >
          <option value={2}>2 Spieler</option>
          <option value={3}>3 Spieler</option>
          <option value={4}>4 Spieler</option>
        </select>
        <div className="text-[#ACACAC] text-sm font-afacad px-1">
          Modus: Klassisch · Regel: Bei 6 nochmal würfeln
        </div>
      </div>
      <Button
        onClick={handleCreate}
        disabled={isLoading}
        className="w-full font-lilita text-xl tracking-wider bg-green text-primary hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase disabled:opacity-60"
      >
        {isLoading ? 'Erstelle...' : 'Erstellen'}
      </Button>
    </div>
  )
}
