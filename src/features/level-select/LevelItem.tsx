import { useNavigate } from 'react-router-dom'
import { ChevronRight, ScrollText } from 'lucide-react'

interface MockLevel {
  id: number
  name: string
  description: string
}

interface LevelItemProps {
  level: MockLevel
  isActive: boolean
  onSelect: (id: number) => void
}

export function LevelItem({ level, isActive, onSelect }: LevelItemProps) {
  const navigate = useNavigate()

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(level.id)}
        onKeyDown={e => e.key === 'Enter' && onSelect(level.id)}
        className={`w-full rounded-[10px] border cursor-pointer transition-colors ${
          isActive
            ? 'bg-white border-white text-[#282828] shadow-[0px_8px_22.2px_rgba(255,255,255,0.25)]'
            : 'bg-[#282828] border-[#797979] text-white hover:border-white/50 shadow-[0px_4px_22.2px_rgba(0,0,0,0.25)]'
        }`}
      >
        <div className="px-[35px] h-[71px] flex items-center">
          <span className="font-[family-name:var(--font-heading)] text-[36px] leading-none">
            {level.name}
          </span>
        </div>
      </div>

      {isActive && (
        <div className="flex gap-[30px] px-0 pt-[20px]" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/lobby/${level.id}`)}
            className="w-[231px] h-[60px] bg-[#57DB8F] text-black hover:bg-[#47cb7f] font-[family-name:var(--font-nav)] font-bold text-[32px] tracking-[2%] rounded-[10px] flex items-center justify-center gap-2"
          >
            Spielen <ChevronRight size={24} strokeWidth={2.5} />
          </button>
          <button
            className="w-[231px] h-[60px] bg-[#EBE036] text-black hover:bg-[#d4ca2e] font-[family-name:var(--font-nav)] font-bold text-[32px] tracking-[2%] rounded-[10px] flex items-center justify-center gap-2"
          >
            Regeln <ScrollText size={22} />
          </button>
        </div>
      )}
    </div>
  )
}
