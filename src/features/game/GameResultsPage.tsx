import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Home, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getResults, getHistory } from '@/api/gameplay.api'
import type { GameResults, GameHistoryEvent, PlayerColor } from '@/api/types'

const COLOR_HEX: Record<PlayerColor, string> = {
  RED: '#DB5757',
  BLUE: '#577CDB',
  GREEN: '#57DB8F',
  YELLOW: '#EBE036',
}

const ACTION_LABELS: Record<string, string> = {
  ROLL: 'Würfelt',
  MOVE: 'Zieht Figur',
  CAPTURE: 'Schlägt Figur ⚔️',
  GOAL: 'Figur im Ziel 🏁',
  GAME_START: 'Spiel gestartet',
  GAME_END: 'Spiel beendet 🏆',
}

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

export function GameResultsPage() {
  const { id: sessionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [results, setResults] = useState<GameResults | null>(null)
  const [history, setHistory] = useState<GameHistoryEvent[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    Promise.all([
      getResults(sessionId),
      getHistory(sessionId),
    ])
      .then(([r, h]) => {
        setResults(r)
        setHistory(h)
      })
      .catch(() => navigate('/'))
  }, [sessionId])

  if (!results) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <span className="text-white text-2xl font-lilita">Lade Ergebnis...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="font-lilita text-white text-5xl uppercase text-center mb-2">
          Spiel beendet
        </h1>
        <p className="text-[#ACACAC] font-afacad text-center mb-8">
          {results.totalTurns != null && `${results.totalTurns} Runden · `}
          {results.durationSeconds != null && formatDuration(results.durationSeconds)}
        </p>

        {/* Placements */}
        <div className="bg-white/5 border border-accent rounded-3xl p-6 mb-4">
          <div className="flex flex-col gap-3">
            {results.placements.map((p) => (
              <div
                key={p.playerId}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 ${
                  p.rank === 1
                    ? 'bg-[#57DB8F]/10 border border-[#57DB8F]/40'
                    : 'bg-white/5'
                }`}
              >
                <span className="font-lilita text-2xl text-white w-8">
                  {p.rank === 1 ? '🏆' : `${p.rank}.`}
                </span>
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: COLOR_HEX[p.color] }} />
                <span className="font-afacad font-semibold text-white flex-1 text-lg">{p.username}</span>
                <div className="text-right text-sm font-afacad text-[#ACACAC]">
                  <div>{p.figuresInGoal}/4 Figuren</div>
                  {p.figuresCaptured != null && (
                    <div>{p.figuresCaptured} geschlagen</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-4">
          <Button
            onClick={() => navigate('/lobby/1')}
            className="flex-1 bg-[#57DB8F] text-[#292929] hover:bg-[#47cb7f] font-lilita text-lg h-14 rounded-[20px] uppercase"
          >
            <Plus size={20} className="mr-2" />
            Neue Lobby
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1 border-accent text-white hover:bg-white/5 font-lilita text-lg h-14 rounded-[20px] uppercase"
          >
            <Home size={20} className="mr-2" />
            Startseite
          </Button>
        </div>

        {/* History accordion */}
        {history.length > 0 && (
          <div className="bg-white/5 border border-accent rounded-3xl overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-6 py-4 text-white font-lilita text-lg uppercase hover:bg-white/5 transition-colors"
            >
              <span>Spielverlauf ({history.length} Ereignisse)</span>
              {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showHistory && (
              <div className="px-4 pb-4 max-h-80 overflow-y-auto flex flex-col gap-1">
                {history.slice(0, 100).map((e) => {
                  const isCapture = e.actionType === 'CAPTURE'
                  return (
                    <div
                      key={e.eventId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-afacad ${
                        isCapture ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/3'
                      }`}
                    >
                      <span className="text-[#ACACAC] shrink-0 w-16 text-xs">{formatTime(e.timestamp)}</span>
                      <span className="text-white flex-1">{ACTION_LABELS[e.actionType] ?? e.actionType}</span>
                      {e.diceValue && <span className="text-[#ACACAC] shrink-0">🎲{e.diceValue}</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
