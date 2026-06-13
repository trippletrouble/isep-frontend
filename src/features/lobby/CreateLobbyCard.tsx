import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CreateLobbyCard() {
  const [playerName, setPlayerName] = useState('')
  const [playerCount, setPlayerCount] = useState<number>(4)
  const [againstAI, setAgainstAI] = useState(false)
  const [gameMode, setGameMode] = useState<'klassisch' | 'erweitert'>('klassisch')

  function handleCreate() {
    // Week 2: POST /sessions with { level, playerCount, againstAI, gameMode }
  }

  return (
    <div className="flex-1 rounded-[40px] border border-[#797979] bg-[#282828] p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex flex-col gap-6">
      <h2 className="font-[family-name:var(--font-nav)] font-bold text-white text-[40px] uppercase tracking-[2%]">
        Lobby erstellen
      </h2>
      <div className="flex flex-col gap-4 flex-1">
        <Input
          type="text"
          placeholder="Dein Name"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          className="bg-[#383838] border-[#797979] text-white placeholder:text-[#ACACAC] h-12 rounded-xl"
        />
        <select
          value={playerCount}
          onChange={e => setPlayerCount(Number(e.target.value))}
          className="bg-[#383838] border border-[#797979] text-white h-12 rounded-xl px-4 w-full"
        >
          <option value={2}>2 Spieler</option>
          <option value={3}>3 Spieler</option>
          <option value={4}>4 Spieler</option>
        </select>
        <select
          value={gameMode}
          onChange={e => setGameMode(e.target.value as 'klassisch' | 'erweitert')}
          className="bg-[#383838] border border-[#797979] text-white h-12 rounded-xl px-4 w-full"
        >
          <option value="klassisch">Klassisch</option>
          <option value="erweitert">Erweitert</option>
        </select>
        <label className="flex items-center gap-3 text-white font-[family-name:var(--font-nav)] font-bold text-[18px] cursor-pointer">
          <input
            type="checkbox"
            checked={againstAI}
            onChange={e => setAgainstAI(e.target.checked)}
            className="w-5 h-5 accent-[#57DB8F]"
          />
          Gegen KI
        </label>
      </div>
      <Button
        onClick={handleCreate}
        className="w-full font-[family-name:var(--font-heading)] text-xl tracking-widest bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
      >
        Erstellen
      </Button>
    </div>
  )
}
