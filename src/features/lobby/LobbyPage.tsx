import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ScrollText } from 'lucide-react'
import { CreateLobbyCard } from './CreateLobbyCard'
import { JoinLobbyCard } from './JoinLobbyCard'
import { SessionListCard } from './SessionListCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { PageSubHeader } from '@/components/layout/PageSubHeader'
import { useLobby } from '@/hooks/useLobby'
import { useAuthStore } from '@/stores/auth.store'
import { getErrorMessage } from '@/lib/errorMessages'
import { useUIStore } from '@/stores/ui.store'
import type { JoinGameRequest } from '@/api/types'

export function LobbyPage() {
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const { sessions, isLoading, fetchSessions, joinLobby, totalCount, page } = useLobby()
  const { user } = useAuthStore()
  const [joiningId, setJoiningId] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions({ status: 'WAITING', page: 0, size: 20 })
  }, [])

  const handleJoin = async (sessionId: string) => {
    if (!user) return
    setJoiningId(sessionId)
    try {
      const body: JoinGameRequest = { playerId: user.userId }
      await joinLobby(sessionId, body)
      navigate('/game/' + sessionId)
    } catch (err) {
      useUIStore.getState().addToast({ type: 'error', title: 'Beitreten fehlgeschlagen', message: getErrorMessage(err) })
    } finally {
      setJoiningId(null)
    }
  }

  const loadMore = () => {
    fetchSessions({ status: 'WAITING', page: page + 1, size: 20 })
  }

  return (
    <div>
      <PageSubHeader
        backTo="/"
        center={`LEVEL ${level}`}
        right={
          <button className="flex items-center gap-2 text-[24px] font-bold hover:text-white transition-colors">
            Regeln <ScrollText size={20} />
          </button>
        }
      />

      <h1 className="font-lilita text-white text-4xl md:text-6xl uppercase leading-none mb-8">
        LEVEL {level}
      </h1>

      <div className="flex gap-6 mb-10">
        <CreateLobbyCard />
        <JoinLobbyCard />
      </div>

      {/* Session Browser */}
      <div>
        <h2 className="font-lilita text-white text-2xl uppercase mb-4">Offene Lobbys</h2>
        <div className="flex flex-col gap-3">
          {isLoading && sessions.length === 0 ? (
            <>
              <SkeletonCard className="h-20" />
              <SkeletonCard className="h-20" />
              <SkeletonCard className="h-20" />
            </>
          ) : sessions.length === 0 ? (
            <p className="text-[#ACACAC] font-afacad text-center py-8">
              Keine offenen Lobbys gefunden – erstelle eine!
            </p>
          ) : (
            sessions.map((s) => (
              <SessionListCard
                key={s.sessionId}
                session={s}
                onJoin={handleJoin}
                isJoining={joiningId === s.sessionId}
              />
            ))
          )}
        </div>
        {sessions.length < totalCount && (
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="mt-4 w-full text-[#ACACAC] hover:text-white font-afacad text-sm underline disabled:opacity-50"
          >
            {isLoading ? 'Laden...' : 'Mehr laden'}
          </button>
        )}
      </div>
    </div>
  )
}
