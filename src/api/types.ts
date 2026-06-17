// ─── ENUMS (als TypeScript union types) ───────────────────────────────────

export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED'
export type PlayerColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW'
export type PieceStatus = 'HOME' | 'ACTIVE' | 'GOAL'
export type PlayerType = 'HUMAN'
export type GameMode = 'CLASSIC'
export type BoardTheme = 'CLASSIC'
export type AdditionalRule = 'THROW_AGAIN_ON_6' | 'THREE_SIXES_LOSE_TURN'
export type MoveOutcome = 'MOVED' | 'CAPTURED' | 'GOAL' | 'GAME_WON'
export type ThemePreference = 'LIGHT' | 'DARK' | 'SYSTEM'
export type GameHistoryActionType = 'ROLL' | 'MOVE' | 'CAPTURE' | 'GOAL' | 'GAME_START' | 'GAME_END'

// ─── RESPONSE WRAPPER ─────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  status: 'success'
  timestamp: string
  data: T
}

export interface ApiErrorResponse {
  status: 'error'
  code: string
  message: string
  details?: unknown
  timestamp: string
}

// ─── AUTH ─────────────────────────────────────────────────────────────────

export interface SessionUser {
  userId: string
  username: string
  roles: string[]
}

// ─── USERS ────────────────────────────────────────────────────────────────

export interface PlayerStats {
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  winRatio: number
  totalFiguresCaptured: number
}

export interface PlayerProfile {
  id: string
  username: string
  avatarUrl?: string | null
  themePreference?: ThemePreference
  isGuest?: boolean
  stats?: PlayerStats
}

// ─── GAME ENTITIES ────────────────────────────────────────────────────────

export interface Figure {
  id: number           // 0–15, global eindeutig
  playerId: string
  position: number     // -1 = HOME, 0-39 = Hauptfeld, 40-55 = Zielgerade, 56 = GOAL
  status: PieceStatus
}

export interface Player {
  id: string
  username: string
  color: PlayerColor
  type: PlayerType
  isCurrentTurn: boolean
  hasFinished: boolean
  figuresInGoal: number  // 0–4
}

export interface LobbySettings {
  numberOfPlayers: number  // 2–4
  mode: GameMode
  boardTheme: BoardTheme
  isPrivate: boolean
  turnTimeLimitSeconds?: number | null
  additionalRules: AdditionalRule[]
}

export interface GameState {
  sessionId: string
  status: GameStatus
  mode?: GameMode
  boardTheme?: BoardTheme
  players: Player[]
  figures: Figure[]
  currentPlayerId: string
  turnNumber: number
  lastDiceValue?: number | null
  diceRolledThisTurn: boolean
  consecutiveSixes: number
  activeRules: AdditionalRule[]
  winnerId?: string | null
  createdAt: string
  lastUpdatedAt: string
}

export interface Lobby {
  sessionId: string
  hostId: string
  settings: LobbySettings
  players: Player[]
  status: GameStatus
  inviteToken?: string | null
  createdAt: string
}

export interface SessionSummary {
  sessionId: string
  status: GameStatus
  playerCount: number
  maxPlayers: number
  mode: GameMode
  boardTheme?: BoardTheme
  hostUsername?: string
  isPrivate: boolean
  createdAt: string
}

export interface PaginatedSessionList {
  sessions: SessionSummary[]
  totalCount: number
  page: number
  size: number
}

// ─── GAMEPLAY ─────────────────────────────────────────────────────────────

export interface PossibleMove {
  figureId: number
  fromPosition: number
  toPosition: number
  capturesOpponent: boolean
}

export interface DiceRollResult {
  value: number           // 1–6
  playerId: string
  possibleMoves: PossibleMove[]
  hasMoves: boolean
  rollAgain: boolean
  consecutiveSixes: number
  turnForfeit: boolean
  gameState: GameState
}

export interface MoveRequest {
  playerId: string
  figureId: number
  targetFieldId: number
}

export interface CapturedFigure {
  figureId: number
  ownerPlayerId: string
  previousPosition: number
}

export interface MoveResult {
  outcome: MoveOutcome
  figureId: number
  fromPosition: number
  toPosition: number
  capturedFigure?: CapturedFigure | null
  gameState: GameState
}

export interface GameResults {
  sessionId: string
  placements: Array<{
    rank: number
    playerId: string
    username: string
    color: PlayerColor
    figuresInGoal: number
    figuresCaptured?: number
  }>
  totalTurns?: number
  durationSeconds?: number
  finishedAt: string
}

export interface GameHistoryEvent {
  eventId: number
  timestamp: string
  playerId: string
  actionType: GameHistoryActionType
  diceValue?: number | null
  figureId?: number | null
  fromPosition?: number | null
  toPosition?: number | null
  outcome?: MoveOutcome | null
}

// ─── REQUESTS ─────────────────────────────────────────────────────────────

export interface CreateSessionRequest {
  hostId: string
  settings: LobbySettings
}

export interface JoinGameRequest {
  playerId: string
  preferredColor?: PlayerColor
  inviteToken?: string
}
