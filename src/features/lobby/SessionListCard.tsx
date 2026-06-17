import type { SessionSummary } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

interface SessionListCardProps {
  session: SessionSummary
  onJoin: (sessionId: string) => void
  isJoining?: boolean
}

export function SessionListCard({ session, onJoin, isJoining }: SessionListCardProps) {
  const timeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (diff < 1) return 'Gerade eben'
    if (diff < 60) return `vor ${diff} Min.`
    return `vor ${Math.floor(diff / 60)} Std.`
  }

  return (
    <div className="flex items-center justify-between bg-white/5 border border-accent hover:border-white/40 rounded-2xl px-6 py-4 transition-colors">
      <div className="flex flex-col gap-1">
        <span className="text-white font-lilita text-lg">
          {session.hostUsername ?? 'Unbekannt'}
        </span>
        <div className="flex items-center gap-3 text-sm text-[#ACACAC] font-afacad">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {session.playerCount} / {session.maxPlayers}
          </span>
          <span>·</span>
          <span>{session.mode}</span>
          <span>·</span>
          <span>{timeAgo(session.createdAt)}</span>
        </div>
      </div>
      <Button
        onClick={() => onJoin(session.sessionId)}
        disabled={isJoining}
        className="bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] font-lilita rounded-xl px-6"
      >
        Beitreten
      </Button>
    </div>
  )
}
