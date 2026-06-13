import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ScrollText } from 'lucide-react'
import { CreateLobbyCard } from './CreateLobbyCard'
import { JoinLobbyCard } from './JoinLobbyCard'

export function LobbyPage() {
  const { level } = useParams<{ level: string }>()

  return (
    <div>
      <div className="w-full flex items-center relative mb-8 text-[#ACACAC] font-[family-name:var(--font-nav)] tracking-[0.02em]">
        <Link
          to="/"
          className="flex items-center gap-2 text-[24px] font-bold hover:text-white transition-colors z-10"
        >
          <ChevronLeft className="w-6" strokeWidth={2.5} /> Zurück
        </Link>
        <span className="absolute w-full text-center text-[24px] font-bold uppercase z-0 pointer-events-none">
          LEVEL {level}
        </span>
        <button className="flex items-center gap-2 text-[24px] font-bold hover:text-white transition-colors z-10 ml-auto">
          Regeln <ScrollText size={20} />
          {/* Week 2: open RulesDialog */}
        </button>
      </div>

      <h1 className="font-[family-name:var(--font-heading)] text-white text-[84px] uppercase leading-none mb-8">
        LEVEL {level}
      </h1>

      <div className="flex gap-6">
        <CreateLobbyCard />
        <JoinLobbyCard />
      </div>
    </div>
  )
}
