import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Board from '../board/Board'
import { DicePanel } from '../dice/DicePanel'
import { LeaderboardPanel } from './LeaderboardPanel'
import { NotificationPanel, type NotificationData } from './NotificationPanel'
import { PageSubHeader } from '@/components/layout/PageSubHeader'
import { LobbyWaitingRoom } from '@/features/lobby/LobbyWaitingRoom'
import { useGameStore } from '@/stores/game.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { useGameActions } from '@/hooks/useGameActions'
import { useSSE } from '@/hooks/useSSE'
import { getSession } from '@/api/sessions.api'
import { getPossibleMoves } from '@/api/gameplay.api'
import { ApiError } from '@/api/client'

export const GamePage = () => {
  const { id: sessionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    gameState, setGameState, status,
    figures, possibleMoves, lastDiceValue,
    handleGameStarted, handleMoveExecuted, handleTurnChanged, handleGameEnded,

  } = useGameStore()

  const { moveFigure, isMoving } = useGameActions()

  const [notification, setNotification] = useState<NotificationData | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [reconnectCount] = useState(0)

  // Viewport detection
  useEffect(() => {
    const checkViewport = () => setIsDesktop(window.innerWidth >= 1024)
    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  // Auto-dismiss notification
  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 5000)
    return () => clearTimeout(timer)
  }, [notification])

  // Initial load
  useEffect(() => {
    if (!sessionId) return
    getSession(sessionId)
      .then((state) => {
        setGameState(state)
        // Nachladen der möglichen Züge falls zwischen Würfeln und Ziehen neu geladen
        if (state.diceRolledThisTurn && user) {
          getPossibleMoves(sessionId, user.userId)
            .then((r) => useGameStore.getState().setPossibleMoves(r.possibleMoves))
            .catch(() => {}) // DICE_NOT_ROLLED ignorieren
        }
        if (state.status === 'FINISHED') {
          navigate(`/game/${sessionId}/results`, { replace: true })
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          useUIStore.getState().addToast({ type: 'error', title: 'Session nicht gefunden' })
          navigate('/')
        }
      })
  }, [sessionId])

  // SSE
  const { isConnected } = useSSE(sessionId ?? null, {
    onGameStarted: (data) => handleGameStarted(data),
    onMoveExecuted: (data) => {
      handleMoveExecuted(data)
      if (data.outcome === 'CAPTURED' && data.capturedFigure) {
        setNotification({
          title: 'SCHLAG!',
          message: `Eine Figur wurde vom Feld geworfen!`,
          iconType: 'CAPTURE',
        })
      } else if (data.outcome === 'GAME_WON') {
        setNotification({ title: 'GEWONNEN! 🏆', message: 'Alle Figuren im Ziel!', iconType: 'WIN' })
      }
    },
    onTurnChanged: (data) => handleTurnChanged(data),
    onGameEnded: (data) => {
      handleGameEnded(data)
      navigate(`/game/${sessionId}/results`)
    },
    onConnected: () => {
      if (sessionId) getSession(sessionId).then(setGameState).catch(() => {})
    },
    onError: () => {
      useUIStore.getState().addToast({
        type: 'error',
        title: 'Verbindung verloren',
        message: 'Bitte Seite neu laden.',
        duration: 0,
      })
    },
  })

  // Reconnect toast
  useEffect(() => {
    if (reconnectCount === 3) {
      useUIStore.getState().addToast({
        type: 'warning',
        title: 'Verbindung unterbrochen',
        message: 'Verbindung wird wiederhergestellt...',
      })
    }
  }, [reconnectCount])

  // Lobby waiting room
  if (!gameState || status === 'WAITING' || status === null) {
    if (!sessionId) return null
    return <LobbyWaitingRoom sessionId={sessionId} />
  }

  // Loading state (gameState exists but still fetching)
  if (!figures.length && status === 'IN_PROGRESS') {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <span className="text-white text-2xl font-lilita">Spiel wird geladen...</span>
      </div>
    )
  }

  const handleMoveFigure = async (figureId: number, toPosition: number) => {
    if (!sessionId) return
    await moveFigure(sessionId, figureId, toPosition)
  }

  const shortId = sessionId ? `#${sessionId.slice(0, 8).toUpperCase()}` : ''

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] bg-primary flex flex-col items-center justify-center relative">
      {/* Mobile notification */}
      <div className="fixed top-3 left-4 right-4 z-50 pointer-events-none lg:hidden">
        <div className="pointer-events-auto max-w-[380px] mx-auto">
          <NotificationPanel data={notification} onClose={() => setNotification(null)} />
        </div>
      </div>

      <PageSubHeader
        center={`LOBBY ${shortId}`}
        right={
          <span className={`w-2 h-2 rounded-full inline-block ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} title={isConnected ? 'Verbunden' : 'Getrennt'} />
        }
      />

      <div className="w-full flex flex-col items-center justify-center flex-1">
        <div className="flex flex-col lg:flex-row w-full gap-6 lg:gap-8 items-center justify-center flex-1 mx-auto">
          <div className="flex flex-col order-2 lg:order-1 items-center justify-center">
            <div className="w-[80vw] h-[70vw] max-w-[70vh] max-h-[70vh] flex justify-center items-center">
              <Board
                diceRoll={lastDiceValue ?? 1}
                apiFigures={figures}
                possibleMoves={possibleMoves}
                onMoveFigure={handleMoveFigure}
                isMoving={isMoving}
              />
            </div>
          </div>

          <div className="w-[70vw] max-w-[70vh] lg:w-[290px] lg:max-w-none shrink-0 flex flex-row lg:flex-col gap-3 items-stretch justify-center order-1 lg:order-2 transition-all h-[180px] sm:h-[240px] lg:h-[480px]">
            <div className="hidden lg:block w-full">
              <NotificationPanel data={notification} onClose={() => setNotification(null)} />
            </div>

            <LeaderboardPanel isSquished={!!notification && isDesktop} className="flex-1 lg:flex-none" />

            <DicePanel sessionId={sessionId!} className="flex-1 lg:flex-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
