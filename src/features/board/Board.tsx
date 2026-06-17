import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  type Point,
  CLOCKWISE_TRACK,
  GREY_TRACK,
  RED_COLORED_TILES,
  YELLOW_COLORED_TILES,
  BLUE_COLORED_TILES,
  GREEN_COLORED_TILES,
  NEST_SLOTS,
} from './BoardPath'
import { Figure } from './Figure'
import { X } from 'lucide-react'
import type { Figure as ApiFigure, PossibleMove } from '@/api/types'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type FigureState = {
  id: string
  apiId: number
  color: string
  position: 'nest' | number | string
  nestIndex: number
  startTrackIndex: number
}

// ── API → Board mapping ─────────────────────────────────────────────────────
// API figure IDs: RED=0-3, BLUE=4-7, GREEN=8-11, YELLOW=12-15
// Board nestIndex:  RED=0-3, GREEN=4-7, YELLOW=8-11, BLUE=12-15
const FIGURE_META: Array<{ color: string; nestIndex: number; startTrackIndex: number; goalBase: number }> = [
  // RED (0-3)
  { color: '#DB5757', nestIndex: 0, startTrackIndex: 0,  goalBase: 40 },
  { color: '#DB5757', nestIndex: 1, startTrackIndex: 0,  goalBase: 40 },
  { color: '#DB5757', nestIndex: 2, startTrackIndex: 0,  goalBase: 40 },
  { color: '#DB5757', nestIndex: 3, startTrackIndex: 0,  goalBase: 40 },
  // BLUE (4-7)
  { color: '#577CDB', nestIndex: 12, startTrackIndex: 13, goalBase: 44 },
  { color: '#577CDB', nestIndex: 13, startTrackIndex: 13, goalBase: 44 },
  { color: '#577CDB', nestIndex: 14, startTrackIndex: 13, goalBase: 44 },
  { color: '#577CDB', nestIndex: 15, startTrackIndex: 13, goalBase: 44 },
  // GREEN (8-11)
  { color: '#57DB8F', nestIndex: 4, startTrackIndex: 39, goalBase: 48 },
  { color: '#57DB8F', nestIndex: 5, startTrackIndex: 39, goalBase: 48 },
  { color: '#57DB8F', nestIndex: 6, startTrackIndex: 39, goalBase: 48 },
  { color: '#57DB8F', nestIndex: 7, startTrackIndex: 39, goalBase: 48 },
  // YELLOW (12-15)
  { color: '#EBE036', nestIndex: 8,  startTrackIndex: 26, goalBase: 52 },
  { color: '#EBE036', nestIndex: 9,  startTrackIndex: 26, goalBase: 52 },
  { color: '#EBE036', nestIndex: 10, startTrackIndex: 26, goalBase: 52 },
  { color: '#EBE036', nestIndex: 11, startTrackIndex: 26, goalBase: 52 },
]

function apiFiguresToBoard(apiFigures: ApiFigure[]): FigureState[] {
  return apiFigures.map((f) => {
    const meta = FIGURE_META[f.id]
    let position: 'nest' | number | string = 'nest'

    if (f.position === -1) {
      position = 'nest'
    } else if (f.position >= 0 && f.position <= 39) {
      position = f.position
    } else if (f.position >= 40 && f.position <= 55) {
      // TODO: confirm goal path range assignment with backend
      const goalIdx = f.position - meta.goalBase
      position = goalIdx >= 0 ? `goal_${goalIdx}` : 'nest'
    } else if (f.position === 56) {
      position = 'center'
    }

    return {
      id: `fig_${f.id}`,
      apiId: f.id,
      color: meta.color,
      position,
      nestIndex: meta.nestIndex,
      startTrackIndex: meta.startTrackIndex,
    }
  })
}

const INITIAL_FIGURES: FigureState[] = FIGURE_META.map((meta, i) => ({
  id: `fig_${i}`,
  apiId: i,
  color: meta.color,
  position: 'nest',
  nestIndex: meta.nestIndex,
  startTrackIndex: meta.startTrackIndex,
}))

interface BoardProps {
  diceRoll?: number
  // API integration props (optional – falls back to local demo mode)
  apiFigures?: ApiFigure[]
  possibleMoves?: PossibleMove[]
  onMoveFigure?: (figureId: number, toPosition: number) => void
  isMoving?: boolean
}

export default function Board({ diceRoll = 1, apiFigures, possibleMoves = [], onMoveFigure, isMoving = false }: BoardProps) {
  const [figures, setFigures] = useState<FigureState[]>(INITIAL_FIGURES)
  const [selectedFigureId, setSelectedFigureId] = useState<string | null>(null)
  const [activePile, setActivePile] = useState<{
    x: number
    y: number
    figures: FigureState[]
  } | null>(null)

  // Sync API figures into board state when provided
  useEffect(() => {
    if (apiFigures && apiFigures.length > 0) {
      setFigures(apiFiguresToBoard(apiFigures))
      setSelectedFigureId(null)
      setActivePile(null)
    }
  }, [apiFigures])

  const possibleMoveIds = new Set(possibleMoves.map((m) => m.figureId))
  const captureIds = new Set(possibleMoves.filter((m) => m.capturesOpponent).map((m) => m.figureId))

  const activeFigure = figures.find((f) => f.id === selectedFigureId)

  const getGoalPathCoordinates = (color: string, index: number): Point | null => {
    switch (color) {
      case '#DB5757': return RED_COLORED_TILES.goalPath[index] || null
      case '#577CDB': return BLUE_COLORED_TILES.goalPath[index] || null
      case '#EBE036': return YELLOW_COLORED_TILES.goalPath[index] || null
      case '#57DB8F': return GREEN_COLORED_TILES.goalPath[index] || null
      default: return null
    }
  }

  const getCenterCoordinates = (color: string): Point => {
    switch (color) {
      case '#DB5757': return { x: 785.5, y: 890 }
      case '#577CDB': return { x: 683, y: 786.5 }
      case '#EBE036': return { x: 785.5, y: 683 }
      case '#57DB8F': return { x: 888, y: 786.5 }
      default: return { x: 785.5, y: 786.5 }
    }
  }

  const getFigureCoordinates = (fig: FigureState): Point | null => {
    if (fig.position === 'nest') return NEST_SLOTS[fig.nestIndex]
    if (typeof fig.position === 'number') return CLOCKWISE_TRACK[fig.position]
    if (typeof fig.position === 'string') {
      if (fig.position === 'center') return getCenterCoordinates(fig.color)
      if (fig.position.startsWith('goal_')) {
        const idx = parseInt(fig.position.split('_')[1], 10)
        return getGoalPathCoordinates(fig.color, idx)
      }
    }
    return null
  }

  const calculateTargetPosition = (
    fig: FigureState,
    roll: number,
  ): { position: 'nest' | number | string; tile: Point | null } | null => {
    if (fig.position === 'nest') {
      if (roll === 6) {
        const targetPos = fig.startTrackIndex
        return { position: targetPos, tile: CLOCKWISE_TRACK[targetPos] }
      }
      return null
    }
    if (typeof fig.position === 'number') {
      const currentSteps = (fig.position - fig.startTrackIndex + 52) % 52
      const nextSteps = currentSteps + roll
      if (nextSteps <= 51) {
        const targetPos = (fig.position + roll) % 52
        return { position: targetPos, tile: CLOCKWISE_TRACK[targetPos] }
      } else {
        const goalIdx = nextSteps - 52
        if (goalIdx <= 4) return { position: `goal_${goalIdx}`, tile: getGoalPathCoordinates(fig.color, goalIdx) }
        if (goalIdx === 5) return { position: 'center', tile: getCenterCoordinates(fig.color) }
        return null
      }
    }
    if (typeof fig.position === 'string' && fig.position.startsWith('goal_')) {
      const currentGoalIdx = parseInt(fig.position.split('_')[1], 10)
      const nextGoalIdx = currentGoalIdx + roll
      if (nextGoalIdx <= 4) return { position: `goal_${nextGoalIdx}`, tile: getGoalPathCoordinates(fig.color, nextGoalIdx) }
      if (nextGoalIdx === 5) return { position: 'center', tile: getCenterCoordinates(fig.color) }
      return null
    }
    return null
  }

  // When API moves are available, show target based on possibleMoves
  const getApiTargetTile = (fig: FigureState): Point | null => {
    if (!apiFigures) return null
    const move = possibleMoves.find((m) => m.figureId === fig.apiId)
    if (!move) return null
    if (move.toPosition >= 0 && move.toPosition <= 39) return CLOCKWISE_TRACK[move.toPosition]
    if (move.toPosition >= 40 && move.toPosition <= 55) {
      const goalIdx = move.toPosition - FIGURE_META[fig.apiId].goalBase
      return goalIdx >= 0 ? getGoalPathCoordinates(fig.color, goalIdx) : null
    }
    if (move.toPosition === 56) return getCenterCoordinates(fig.color)
    return null
  }

  const targetResult = activeFigure
    ? (apiFigures ? null : calculateTargetPosition(activeFigure, diceRoll))
    : null
  const targetTile = apiFigures
    ? (activeFigure ? getApiTargetTile(activeFigure) : null)
    : targetResult?.tile || null

  const getPathOfPositions = (
    startPos: 'nest' | number | string,
    targetPos: 'nest' | number | string,
    roll: number,
    fig: FigureState,
  ): Array<'nest' | number | string> => {
    if (startPos === 'nest') return [targetPos]
    const path: Array<'nest' | number | string> = []
    if (typeof startPos === 'number') {
      const currentSteps = (startPos - fig.startTrackIndex + 52) % 52
      let curr = startPos
      for (let step = 1; step <= roll; step++) {
        const stepsFromStart = currentSteps + step
        if (stepsFromStart <= 51) {
          curr = (curr + 1) % 52
          path.push(curr)
        } else {
          const goalIdx = stepsFromStart - 52
          if (goalIdx <= 4) path.push(`goal_${goalIdx}`)
          else if (goalIdx === 5) path.push('center')
        }
      }
    } else if (typeof startPos === 'string' && startPos.startsWith('goal_')) {
      const startGoalIdx = parseInt(startPos.split('_')[1], 10)
      for (let step = 1; step <= roll; step++) {
        const goalIdx = startGoalIdx + step
        if (goalIdx <= 4) path.push(`goal_${goalIdx}`)
        else if (goalIdx === 5) path.push('center')
      }
    }
    return path
  }

  const handleMoveToTarget = async (fig: FigureState) => {
    if (!fig) return
    setSelectedFigureId(null)
    setActivePile(null)

    // API mode: call parent handler, animate optimistically
    if (apiFigures && onMoveFigure) {
      const move = possibleMoves.find((m) => m.figureId === fig.apiId)
      if (!move) return
      // Optimistic animation
      const path = getPathOfPositions(fig.position, fig.position, 1, fig)
      if (path.length > 0) {
        for (const pos of path) {
          setFigures((prev) => prev.map((f) => f.id === fig.id ? { ...f, position: pos } : f))
          await sleep(200)
        }
      }
      onMoveFigure(fig.apiId, move.toPosition)
      return
    }

    // Demo mode: local movement
    if (!targetResult) return
    const targetPos = targetResult.position
    const path = getPathOfPositions(fig.position, targetPos, diceRoll, fig)
    for (const pos of path) {
      setFigures((prev) => prev.map((f) => f.id === fig.id ? { ...f, position: pos } : f))
      await sleep(250)
    }
    if (typeof targetPos === 'number') {
      setFigures((prev) =>
        prev.map((f) => {
          if (f.color !== fig.color && f.position === targetPos) {
            toast.warning(`⚔️ Schlag! Figur ${f.id.toUpperCase()} wurde heimgeschickt!`)
            return { ...f, position: 'nest' }
          }
          return f
        }),
      )
    }
  }

  const handleFigureClick = (fig: FigureState) => {
    if (isMoving) return

    // API mode
    if (apiFigures) {
      if (!possibleMoveIds.has(fig.apiId)) return
      if (fig.id === selectedFigureId) {
        handleMoveToTarget(fig)
      } else {
        setSelectedFigureId(fig.id)
      }
      return
    }

    // Demo mode
    if (activeFigure && targetResult && fig.position === targetResult.position) {
      handleMoveToTarget(activeFigure)
      return
    }
    if (fig.position === 'nest' && diceRoll !== 6) {
      toast.error('Du brauchst eine 6 um aus dem Haus zu ziehen!')
      return
    }
    setSelectedFigureId(fig.id === selectedFigureId ? null : fig.id)
    setActivePile(null)
  }

  const getOffsetAndScale = (groupSize: number, index: number) => {
    if (groupSize <= 1) return { dx: 0, dy: 0, scale: 1.0 }
    if (groupSize === 2) return { dx: index === 0 ? -18 : 18, dy: 0, scale: 0.75 }
    if (groupSize === 3) {
      if (index === 0) return { dx: -18, dy: 0, scale: 0.6 }
      if (index === 1) return { dx: 18, dy: 0, scale: 0.6 }
      return { dx: 0, dy: -18, scale: 0.6 }
    }
    if (groupSize === 4) {
      if (index === 0) return { dx: -18, dy: 0, scale: 0.6 }
      if (index === 1) return { dx: 18, dy: 0, scale: 0.6 }
      if (index === 2) return { dx: 0, dy: -18, scale: 0.6 }
      return { dx: 0, dy: 18, scale: 0.6 }
    }
    return { dx: 0, dy: 0, scale: 0.8 }
  }

  const getPopoverStyles = () => {
    if (!activePile) return {}
    const SVG_OFFSET_X = 55
    const SVG_OFFSET_Y = 45
    const isRightHalf = activePile.x > 785
    const isBottomArea = activePile.y > 1100
    const anchorX = isRightHalf ? activePile.x - SVG_OFFSET_X : activePile.x + SVG_OFFSET_X
    const anchorY = isBottomArea ? activePile.y + SVG_OFFSET_Y : activePile.y - SVG_OFFSET_Y
    return {
      left: `${(anchorX / 1571) * 100}%`,
      top: `${(anchorY / 1573) * 100}%`,
      transform: `translate(${isRightHalf ? '-100%' : '0%'}, ${isBottomArea ? '-100%' : '0%'})`,
      transition: 'all 200ms ease-out',
    }
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 1571 1573"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full max-w-full max-h-full block select-none ${isMoving ? 'pointer-events-none' : ''}`}
        onClick={(e) => {
          const target = e.target as SVGElement
          if (['svg', 'path', 'rect', 'g'].includes(target.tagName)) {
            setSelectedFigureId(null)
            setActivePile(null)
          }
        }}
      >
        {/* Board background paths */}
        <path fillRule="evenodd" clipRule="evenodd" d="M545 0C583.66 3.54343e-06 615 31.3401 615 70V545C615 583.66 583.66 615 545 615H70C31.3401 615 0 583.66 0 545V70C3.54389e-06 31.3401 31.3401 0 70 0H545ZM124.343 84.3428C102.251 84.3428 84.3428 102.251 84.3428 124.343V490.657C84.3429 512.748 102.251 530.657 124.343 530.657H490.657C512.749 530.657 530.657 512.749 530.657 490.657V124.343C530.657 102.251 512.749 84.3428 490.657 84.3428H124.343Z" fill="#577CDB" />
        <path fillRule="evenodd" clipRule="evenodd" d="M1500 0C1538.66 3.54343e-06 1570 31.3401 1570 70V545C1570 583.66 1538.66 615 1500 615H1025C986.34 615 955 583.66 955 545V70C955 31.3401 986.34 0 1025 0H1500ZM1079.34 84.3428C1057.25 84.3428 1039.34 102.251 1039.34 124.343V490.657C1039.34 512.748 1057.25 530.657 1079.34 530.657H1445.66C1467.75 530.657 1485.66 512.749 1485.66 490.657V124.343C1485.66 102.251 1467.75 84.3428 1445.66 84.3428H1079.34Z" fill="#EBE036" />
        <path fillRule="evenodd" clipRule="evenodd" d="M565.5 958C593.114 958 615.5 980.386 615.5 1008V1523C615.5 1550.61 593.114 1573 565.5 1573H50.5C22.8858 1573 0.5 1550.61 0.5 1523V1008C0.5 980.386 22.8858 958 50.5 958H565.5ZM124.843 1042.34C102.751 1042.34 84.8428 1060.25 84.8428 1082.34V1448.66C84.8428 1470.75 102.751 1488.66 124.843 1488.66H491.157C513.249 1488.66 531.157 1470.75 531.157 1448.66V1082.34C531.157 1060.25 513.249 1042.34 491.157 1042.34H124.843Z" fill="#DB5757" />
        <path fillRule="evenodd" clipRule="evenodd" d="M1520.5 958C1548.11 958 1570.5 980.386 1570.5 1008V1523C1570.5 1550.61 1548.11 1573 1520.5 1573H1005.5C977.886 1573 955.5 1550.61 955.5 1523V1008C955.5 980.386 977.886 958 1005.5 958H1520.5ZM1079.84 1042.34C1057.75 1042.34 1039.84 1060.25 1039.84 1082.34V1448.66C1039.84 1470.75 1057.75 1488.66 1079.84 1488.66H1446.16C1468.25 1488.66 1486.16 1470.75 1486.16 1448.66V1082.34C1486.16 1060.25 1468.25 1042.34 1446.16 1042.34H1079.84Z" fill="#57DB8F" />

        <BoardCenter />

        {GREY_TRACK.map((p, i) => (
          <rect key={`grey-${i}`} x={p.x - 45} y={p.y - 45} width="90" height="90" rx="15" fill="#5B5B5B" />
        ))}
        {BLUE_COLORED_TILES.goalPath.map((p, i) => (
          <rect key={`blue-goal-${i}`} x={p.x - 45} y={p.y - 45} width="90" height="90" rx="15" fill="#577CDB" />
        ))}
        {YELLOW_COLORED_TILES.goalPath.map((p, i) => (
          <rect key={`yellow-goal-${i}`} x={p.x - 45} y={p.y - 45} width="90" height="90" rx="15" fill="#EBE036" />
        ))}
        {RED_COLORED_TILES.goalPath.map((p, i) => (
          <rect key={`red-goal-${i}`} x={p.x - 45} y={p.y - 45} width="90" height="90" rx="15" fill="#DB5757" />
        ))}
        {GREEN_COLORED_TILES.goalPath.map((p, i) => (
          <rect key={`green-goal-${i}`} x={p.x - 45} y={p.y - 45} width="90" height="90" rx="15" fill="#57DB8F" />
        ))}
        {[RED_COLORED_TILES.safeZone, BLUE_COLORED_TILES.safeZone, YELLOW_COLORED_TILES.safeZone, GREEN_COLORED_TILES.safeZone].map((p, i) => {
          const startColors = ['#DB5757', '#577CDB', '#EBE036', '#57DB8F']
          return <rect key={`safe-start-${i}`} x={p.x - 45} y={p.y - 45} width="90" height="90" rx="15" fill={startColors[i]} />
        })}
        {NEST_SLOTS.map((p, i) => (
          <rect key={`nest-${i}`} x={p.x - 66.3} y={p.y - 66.3} width="132.6" height="132.6" rx="20" fill="#5B5B5B" />
        ))}

        {/* Figures */}
        {Object.entries(
          figures.reduce((acc, fig) => {
            const coords = getFigureCoordinates(fig)
            if (!coords) return acc
            const key = `${coords.x.toFixed(1)},${coords.y.toFixed(1)}`
            if (!acc[key]) acc[key] = { coords, figures: [] }
            acc[key].figures.push(fig)
            return acc
          }, {} as Record<string, { coords: Point; figures: FigureState[] }>),
        ).map(([key, group]) => {
          const { coords, figures: groupFigs } = group
          const N = groupFigs.length
          const isCenter = groupFigs[0].position === 'center'

          if (N === 1) {
            const fig = groupFigs[0]
            const isSelected = fig.id === selectedFigureId
            const isMovable = apiFigures ? possibleMoveIds.has(fig.apiId) : true
            const willCapture = captureIds.has(fig.apiId)

            return (
              <g key={fig.id}>
                {/* Highlight ring for possible moves */}
                {isMovable && !isCenter && apiFigures && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={42}
                    fill={willCapture ? 'rgba(220,50,50,0.15)' : 'rgba(87,219,143,0.15)'}
                    stroke={willCapture ? '#DC3232' : '#57DB8F'}
                    strokeWidth="3"
                    strokeDasharray="12 6"
                    className="animate-spin"
                    style={{ transformOrigin: `${coords.x}px ${coords.y}px`, animationDuration: '6s' }}
                  />
                )}
                <Figure
                  x={coords.x}
                  y={coords.y}
                  color={fig.color}
                  isSelected={isSelected}
                  onClick={isCenter ? undefined : () => handleFigureClick(fig)}
                />
              </g>
            )
          } else if (N <= 4) {
            return groupFigs.map((fig, idx) => {
              const { dx, dy, scale } = getOffsetAndScale(N, idx)
              const isSelected = fig.id === selectedFigureId
              return (
                <Figure
                  key={fig.id}
                  x={coords.x + dx}
                  y={coords.y + dy}
                  color={fig.color}
                  scale={scale}
                  isSelected={isSelected}
                  onClick={isCenter ? undefined : () => {
                    setActivePile({ x: coords.x, y: coords.y, figures: groupFigs })
                  }}
                />
              )
            })
          } else {
            const primaryColor = groupFigs[0].color
            const isAnySelected = groupFigs.some((f) => f.id === selectedFigureId)
            return (
              <Figure
                key={`stack-${key}`}
                x={coords.x}
                y={coords.y}
                color={primaryColor}
                count={N}
                isSelected={isAnySelected}
                onClick={isCenter ? undefined : () => {
                  setActivePile({ x: coords.x, y: coords.y, figures: groupFigs })
                }}
              />
            )
          }
        })}

        {/* Target indicator */}
        {targetTile && (
          <circle
            cx={targetTile.x}
            cy={targetTile.y}
            r={36}
            fill="rgba(255, 255, 255, 0.2)"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeDasharray="16 8"
            className="animate-spin"
            style={{ cursor: 'pointer', transformOrigin: `${targetTile.x}px ${targetTile.y}px`, animationDuration: '4s' }}
            onClick={() => activeFigure && handleMoveToTarget(activeFigure)}
          />
        )}
      </svg>

      {/* Pile popover */}
      {activePile && (
        <div
          className="absolute bg-primary backdrop-blur border border-accent rounded-2xl p-4 shadow-xl z-50 flex flex-col gap-2 w-48 text-white"
          style={getPopoverStyles()}
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-1">
            <span className="font-lilita text-sm uppercase tracking-wider">Figuren-Stapel</span>
            <button onClick={() => setActivePile(null)} className="text-white/40 hover:text-white transition-colors">
              <X />
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
            {activePile.figures.map((fig) => {
              const colorNameMap: Record<string, string> = {
                '#577CDB': 'Blau', '#EBE036': 'Gelb', '#DB5757': 'Rot', '#57DB8F': 'Grün',
              }
              const label = `${colorNameMap[fig.color] || 'Spieler'} ${fig.id.toUpperCase()}`
              const isSelected = fig.id === selectedFigureId
              return (
                <button
                  key={fig.id}
                  onClick={() => {
                    handleFigureClick(fig)
                    setActivePile(null)
                  }}
                  className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all text-left font-afacad font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/85'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: fig.color }} />
                  <span className="text-base">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function BoardCenter() {
  return (
    <g id="fe1-03-board-center-triangles">
      <path d="M764.812 776.889L653.441 665.637C646.798 659.002 635.5 663.738 635.5 673.159V895.662C635.5 905.083 646.798 909.82 653.441 903.184L764.812 791.932C768.961 787.788 768.961 781.034 764.812 776.889Z" fill="#577CDB" />
      <path d="M793.498 765.174L904.013 653.06C910.605 646.373 905.899 635 896.541 635L675.511 635C666.153 635 661.448 646.373 668.04 653.06L778.554 765.174C782.672 769.351 789.381 769.351 793.498 765.174Z" fill="#EBE036" />
      <path d="M778.554 806.826L668.04 918.94C661.448 925.627 666.153 937 675.512 937H896.541C905.899 937 910.605 925.627 904.013 918.94L793.498 806.826C789.381 802.649 782.672 802.649 778.554 806.826Z" fill="#DB5757" />
      <path d="M806.188 791.932L917.559 903.184C924.202 909.82 935.5 905.083 935.5 895.662L935.5 673.159C935.5 663.738 924.202 659.001 917.559 665.637L806.188 776.889C802.039 781.033 802.039 787.788 806.188 791.932Z" fill="#57DB8F" />
    </g>
  )
}
