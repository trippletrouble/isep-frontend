import { useParams, Link } from 'react-router-dom'
import { CreateLobbyCard } from './CreateLobbyCard'
import { JoinLobbyCard } from './JoinLobbyCard'

export function LobbyPage() {
  const { level } = useParams<{ level: string }>()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="text-[#ACACAC] font-[family-name:var(--font-nav)] font-bold text-[24px] tracking-[2%] hover:text-white transition-colors flex items-center gap-2"
        >
          <span>‹</span> Zurück
        </Link>
        <button className="text-[#ACACAC] font-[family-name:var(--font-nav)] font-bold text-[24px] tracking-[2%] hover:text-white transition-colors flex items-center gap-2">
          Regeln <span>📄</span>
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
