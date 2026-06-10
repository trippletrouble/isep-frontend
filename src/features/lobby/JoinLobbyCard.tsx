import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function JoinLobbyCard() {
  const [lobbyCode, setLobbyCode] = useState('')

  function handleJoin() {
    // Week 2: POST /sessions/:id/join with lobby code
  }

  return (
    <div className="flex-1 rounded-[40px] border border-[#797979] bg-[#282828] p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex flex-col gap-6">
      <h2 className="font-[family-name:var(--font-nav)] font-bold text-white text-[40px] uppercase tracking-[2%]">
        Lobby beitreten
      </h2>
      <div className="flex flex-col gap-4 flex-1">
        <Input
          type="text"
          placeholder="Lobby-Code"
          value={lobbyCode}
          onChange={e => setLobbyCode(e.target.value)}
          className="bg-[#383838] border-[#797979] text-white placeholder:text-[#ACACAC] h-12 rounded-xl"
        />
      </div>
      <Button
        onClick={handleJoin}
        className="w-full font-[family-name:var(--font-heading)] text-xl tracking-widest bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
      >
        Beitreten
      </Button>
    </div>
  )
}
