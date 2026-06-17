import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth.store'
import { joinSession } from '@/api/lobby.api'
import { useUIStore } from '@/stores/ui.store'
import { useLobbyStore } from '@/stores/lobby.store'
import { getErrorMessage } from '@/lib/errorMessages'

export function JoinLobbyCard() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  async function handleJoin() {
    const trimmed = code.trim()
    if (!trimmed) return
    const user = useAuthStore.getState().user
    if (!user) return

    setIsLoading(true)
    try {
      // trimmed wird sowohl als sessionId-Fallback als auch als inviteToken übergeben.
      // TODO: Backend klären ob Lookup-Endpoint für inviteToken→sessionId existiert.
      const lobby = await joinSession(trimmed, {
        playerId: user.userId,
        inviteToken: ***ENTFERNT***
      })
      useLobbyStore.getState().setCurrentLobby(lobby)
      navigate('/game/' + lobby.sessionId)
    } catch (err) {
      useUIStore.getState().addToast({
        type: 'error',
        title: 'Beitreten fehlgeschlagen',
        message: getErrorMessage(err),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 rounded-[40px] border border-accent bg-primary p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex flex-col gap-6">
      <span className="font-bold text-white text-[40px] uppercase tracking-[2%]">
        Lobby beitreten
      </span>
      <div className="flex flex-col gap-4 flex-1">
        <Input
          type="text"
          placeholder="Einladungslink oder Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          className="bg-primary border-accent text-white placeholder:text-accent h-12 rounded-xl"
        />
      </div>
      <Button
        onClick={handleJoin}
        disabled={isLoading || !code.trim()}
        className="w-full font-lilita text-xl tracking-wider bg-green text-primary hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase disabled:opacity-60"
      >
        {isLoading ? 'Verbinde...' : 'Beitreten'}
      </Button>
    </div>
  )
}
