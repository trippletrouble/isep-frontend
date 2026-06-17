import { useGameStore } from '@/stores/game.store'
import { useAuthStore } from '@/stores/auth.store'
import type { PlayerColor } from '@/api/types'

const COLOR_BG: Record<PlayerColor, string> = {
  RED: 'bg-[#DB5757]',
  BLUE: 'bg-[#577CDB]',
  GREEN: 'bg-[#57DB8F]',
  YELLOW: 'bg-[#EBE036]',
}

interface LeaderboardPanelProps {
  isSquished?: boolean
  className?: string
}

export const LeaderboardPanel = ({ isSquished, className = '' }: LeaderboardPanelProps) => {
  const { players } = useGameStore()
  const { user } = useAuthStore()

  // Sort: finished first, then by figuresInGoal desc
  const sorted = [...players].sort((a, b) => {
    if (a.hasFinished && !b.hasFinished) return -1
    if (!a.hasFinished && b.hasFinished) return 1
    return b.figuresInGoal - a.figuresInGoal
  })

  return (
    <div
      className={`border border-accent hover:border-white rounded-2xl lg:rounded-4xl flex flex-col w-full min-h-0 min-w-0 transition-all overflow-hidden ${className} ${
        isSquished
          ? 'h-full lg:h-auto lg:max-h-[84px] lg:shrink-0 p-4 lg:p-6 duration-[800ms] ease-[cubic-bezier(0.4,1.8,0.5,1)]'
          : 'max-h-[1000px] h-full lg:h-auto p-4 lg:p-8 duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]'
      }`}
    >
      <h2
        className={`text-sm sm:text-base md:text-xl lg:text-2xl text-white font-lilita uppercase tracking-[0.02em] text-center drop-shadow-md shrink-0 truncate transition-all ${
          isSquished ? 'mb-3 lg:mb-0 duration-[800ms]' : 'mb-3 lg:mb-6 duration-[500ms]'
        }`}
      >
        Leaderboard
      </h2>

      <div
        className={`flex flex-col font-afacad text-base lg:text-xl text-white transition-all overflow-y-auto custom-scrollbar flex-1 justify-center ${
          isSquished
            ? 'opacity-100 lg:opacity-0 translate-y-0 lg:translate-y-8 duration-[400ms]'
            : 'opacity-100 translate-y-0 duration-[500ms] delay-100'
        }`}
      >
        <div className="w-full flex flex-col justify-center gap-2 lg:gap-4">
          {sorted.length === 0 ? (
            // Skeletons while loading
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="flex gap-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
                  ))}
                </div>
              </div>
            ))
          ) : (
            sorted.map((p) => (
              <div key={p.id} className="flex justify-between items-center shrink-0">
                <span className={`font-semibold text-xs sm:text-sm md:text-lg lg:text-2xl tracking-wide truncate min-w-0 ${p.isCurrentTurn ? 'text-[#57DB8F]' : 'text-white'}`}>
                  {p.hasFinished && '✓ '}
                  {p.username}
                  {p.id === user?.userId && ' (Du)'}
                  {p.isCurrentTurn && ' ▶'}
                </span>
                <div className="flex gap-1 lg:gap-2 shrink-0">
                  {Array.from({ length: 4 }).map((_, dotIdx) => {
                    const isFilled = dotIdx < p.figuresInGoal
                    return (
                      <div
                        key={dotIdx}
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 border-2 border-primary rounded-full ${
                          isFilled ? `${COLOR_BG[p.color]} shadow-[0px_6px_22.2px_rgba(255,255,255,0.05)]` : 'bg-transparent'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
