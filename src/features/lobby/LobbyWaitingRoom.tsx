import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, LogOut, Play, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useLobby } from '@/hooks/useLobby'
import { useAuthStore } from '@/stores/auth.store'
import { useGameStore } from '@/stores/game.store'
import { useUIStore } from '@/stores/ui.store'
import { useSSE } from '@/hooks/useSSE'
import { getErrorMessage } from '@/lib/errorMessages'
import { startSession } from '@/api/sessions.api'
import type { PlayerColor, AdditionalRule } from '@/api/types'

const COLOR_HEX: Record<PlayerColor, string> = {
  RED: '#DB5757',
  BLUE: '#577CDB',
  GREEN: '#57DB8F',
  YELLOW: '#EBE036',
}

const COLOR_LABEL: Record<PlayerColor, string> = {
  RED: 'Rot',
  BLUE: 'Blau',
  GREEN: 'Grün',
  YELLOW: 'Gelb',
}

const RULE_LABEL: Record<AdditionalRule, string> = {
  THROW_AGAIN_ON_6: 'Bei 6 nochmal würfeln',
  THREE_SIXES_LOSE_TURN: '3× Sechs = Zug verloren',
}

interface LobbyWaitingRoomProps {
  sessionId: string
}

export function LobbyWaitingRoom({ sessionId }: LobbyWaitingRoomProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentLobby, isLoading, fetchLobby, generateInvite, leaveLobby } = useLobby()
  const { setGameState } = useGameStore()

  const [isStarting, setIsStarting] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteData, setInviteData] = useState<{ inviteToken: string; inviteUrl: string; expiresAt: string } | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  useEffect(() => {
    fetchLobby(sessionId)
    const interval = setInterval(() => fetchLobby(sessionId), 3000)
    return () => clearInterval(interval)
  }, [sessionId])

  useSSE(sessionId, {
    onGameState: (data) => setGameState(data),
    onGameStarted: (data) => setGameState(data),
  })

  const isHost = currentLobby?.hostId === user?.id

  const handleStart = async () => {
    setIsStarting(true)
    try {
      await startSession(sessionId)
      navigate(`/game/${sessionId}`)
    } catch (err) {
      useUIStore.getState().addToast({ type: 'error', title: 'Starten fehlgeschlagen', message: getErrorMessage(err) })
    } finally {
      setIsStarting(false)
    }
  }

  const handleLeave = async () => {
    setIsLeaving(true)
    try {
      await leaveLobby(sessionId)
      navigate('/')
    } catch {
      navigate('/')
    } finally {
      setIsLeaving(false)
      setShowLeaveConfirm(false)
    }
  }

  const handleInvite = async () => {
    setIsInviting(true)
    try {
      const data = await generateInvite(sessionId)
      setInviteData(data)
      setShowInviteDialog(true)
    } catch (err) {
      useUIStore.getState().addToast({ type: 'error', title: 'Einladung fehlgeschlagen', message: getErrorMessage(err) })
    } finally {
      setIsInviting(false)
    }
  }

  const copyInvite = () => {
    if (!inviteData) return
    navigator.clipboard.writeText(inviteData.inviteUrl)
    useUIStore.getState().addToast({ type: 'success', title: 'Link kopiert! ✓' })
  }

  const maxPlayers = currentLobby?.settings.numberOfPlayers ?? 4
  const players = currentLobby?.players ?? []
  const emptySlots = Math.max(0, maxPlayers - players.length)

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} Uhr`
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="font-lilita text-white text-4xl uppercase mb-2 text-center">
          Lobby
        </h1>
        <p className="text-[#ACACAC] font-afacad text-center mb-8 text-sm">
          #{sessionId.slice(0, 8).toUpperCase()}
        </p>

        {/* Player Slots */}
        <div className="bg-white/5 border border-accent rounded-3xl p-6 mb-4">
          <h2 className="font-lilita text-white text-xl uppercase mb-4">Spieler</h2>
          <div className="flex flex-col gap-3">
            {isLoading && players.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} className="h-14" />
              ))
            ) : (
              <>
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLOR_HEX[p.color] }} />
                    <span className="text-white font-afacad font-semibold flex-1">{p.username}</span>
                    <span className="text-[#ACACAC] text-sm font-afacad">{COLOR_LABEL[p.color]}</span>
                    {p.id === currentLobby?.hostId && (
                      <span className="text-xs text-[#57DB8F] font-afacad">Host</span>
                    )}
                    {p.id === user?.id && (
                      <span className="text-xs text-[#ACACAC] font-afacad">(Du)</span>
                    )}
                  </div>
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 border border-dashed border-white/20 rounded-2xl px-4 py-3">
                    <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                    <span className="text-[#ACACAC] font-afacad text-sm">Wartet auf Spieler...</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Settings */}
        {currentLobby && (
          <div className="bg-white/5 border border-accent rounded-3xl p-6 mb-4">
            <h2 className="font-lilita text-white text-xl uppercase mb-3">Einstellungen</h2>
            <div className="flex flex-col gap-2 text-sm font-afacad text-[#ACACAC]">
              <div className="flex justify-between">
                <span>Spieler</span>
                <span className="text-white">{currentLobby.settings.numberOfPlayers}</span>
              </div>
              <div className="flex justify-between">
                <span>Modus</span>
                <span className="text-white">{currentLobby.settings.mode}</span>
              </div>
              <div className="flex justify-between">
                <span>Zeitlimit</span>
                <span className="text-white">
                  {currentLobby.settings.turnTimeLimitSeconds ? `${currentLobby.settings.turnTimeLimitSeconds}s` : 'Kein Limit'}
                </span>
              </div>
              {currentLobby.settings.additionalRules.length > 0 && (
                <div className="flex flex-col gap-1 pt-1">
                  <span>Regeln:</span>
                  {currentLobby.settings.additionalRules.map((r) => (
                    <span key={r} className="text-white ml-2">· {RULE_LABEL[r]}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isHost ? (
            <>
              <Button
                onClick={handleStart}
                disabled={isStarting || players.length < 2}
                className="w-full font-lilita text-xl bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase disabled:opacity-50"
              >
                <Play size={20} className="mr-2" />
                {isStarting ? 'Starte...' : 'Spiel starten'}
              </Button>
              {players.length < 2 && (
                <p className="text-[#ACACAC] text-xs font-afacad text-center">
                  Mindestens 2 Spieler benötigt
                </p>
              )}
              <Button
                onClick={handleInvite}
                disabled={isInviting}
                variant="outline"
                className="w-full font-lilita text-lg border-accent text-white hover:bg-white/5 h-12 rounded-[20px] uppercase"
              >
                <Share2 size={16} className="mr-2" />
                {isInviting ? 'Generiere...' : 'Einladen'}
              </Button>
            </>
          ) : (
            <p className="text-[#ACACAC] font-afacad text-center py-4">
              Warte auf den Host...
            </p>
          )}

          <Button
            onClick={() => setShowLeaveConfirm(true)}
            variant="ghost"
            className="w-full font-afacad text-[#ACACAC] hover:text-white hover:bg-white/5 h-10 rounded-[20px]"
          >
            <LogOut size={16} className="mr-2" />
            Lobby verlassen
          </Button>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-primary border-accent text-white">
          <DialogHeader>
            <DialogTitle className="font-lilita text-2xl">Freunde einladen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteData?.inviteUrl ?? ''}
                className="bg-white/5 border-accent text-white font-afacad"
              />
              <Button onClick={copyInvite} className="bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] shrink-0">
                <Copy size={16} />
              </Button>
            </div>
            {inviteData?.expiresAt && (
              <p className="text-[#ACACAC] text-sm font-afacad">
                Gültig bis: {formatTime(inviteData.expiresAt)}
              </p>
            )}
            <p className="text-[#ACACAC] text-xs font-afacad">
              Jeder neue Klick auf „Einladen" macht den alten Link ungültig.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Confirm Dialog */}
      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent className="bg-primary border-accent text-white">
          <DialogHeader>
            <DialogTitle className="font-lilita text-2xl">Lobby verlassen?</DialogTitle>
          </DialogHeader>
          <p className="text-[#ACACAC] font-afacad">
            Möchtest du diese Lobby wirklich verlassen?
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowLeaveConfirm(false)}
              className="flex-1 border-accent text-white hover:bg-white/5"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleLeave}
              disabled={isLeaving}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {isLeaving ? 'Verlasse...' : 'Verlassen'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
