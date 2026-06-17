import { create } from 'zustand'
import type { GameState, Figure, Player, PossibleMove, DiceRollResult, MoveResult, GameResults, GameStatus } from '../api/types'

interface GameStoreState {
  gameState: GameState | null
  figures: Figure[]
  players: Player[]
  currentPlayerId: string | null
  lastDiceValue: number | null
  diceRolledThisTurn: boolean
  possibleMoves: PossibleMove[]
  consecutiveSixes: number
  status: GameStatus | null
  winnerId: string | null
  turnNumber: number
  isLoading: boolean
  error: string | null

  setGameState: (state: GameState) => void
  setDiceResult: (result: DiceRollResult) => void
  setMoveResult: (result: MoveResult) => void
  setPossibleMoves: (moves: PossibleMove[]) => void
  clearPossibleMoves: () => void
  handleGameStarted: (data: GameState) => void
  handleMoveExecuted: (data: MoveResult) => void
  handleTurnChanged: (data: { currentPlayerId: string; turnNumber: number }) => void
  handleGameEnded: (data: GameResults) => void
  reset: () => void
}

const initialState = {
  gameState: null,
  figures: [],
  players: [],
  currentPlayerId: null,
  lastDiceValue: null,
  diceRolledThisTurn: false,
  possibleMoves: [],
  consecutiveSixes: 0,
  status: null,
  winnerId: null,
  turnNumber: 0,
  isLoading: false,
  error: null,
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  ...initialState,

  setGameState: (state: GameState) => {
    set({
      gameState: state,
      figures: state.figures,
      players: state.players,
      currentPlayerId: state.currentPlayerId,
      lastDiceValue: state.lastDiceValue ?? null,
      diceRolledThisTurn: state.diceRolledThisTurn,
      consecutiveSixes: state.consecutiveSixes,
      status: state.status,
      winnerId: state.winnerId ?? null,
      turnNumber: state.turnNumber,
      possibleMoves: [],
    })
  },

  setDiceResult: (result: DiceRollResult) => {
    get().setGameState(result.gameState)
    set({
      lastDiceValue: result.value,
      possibleMoves: result.possibleMoves,
      consecutiveSixes: result.consecutiveSixes,
      diceRolledThisTurn: true,
    })
  },

  setMoveResult: (result: MoveResult) => {
    get().setGameState(result.gameState)
    set({
      possibleMoves: [],
      diceRolledThisTurn: false,
    })
  },

  setPossibleMoves: (moves: PossibleMove[]) => {
    set({ possibleMoves: moves })
  },

  clearPossibleMoves: () => {
    set({ possibleMoves: [] })
  },

  handleGameStarted: (data: GameState) => {
    get().setGameState(data)
  },

  handleMoveExecuted: (data: MoveResult) => {
    get().setMoveResult(data)
  },

  handleTurnChanged: (data: { currentPlayerId: string; turnNumber: number }) => {
    set({
      currentPlayerId: data.currentPlayerId,
      turnNumber: data.turnNumber,
      diceRolledThisTurn: false,
      possibleMoves: [],
      consecutiveSixes: 0,
    })
  },

  handleGameEnded: (data: GameResults) => {
    set({
      status: 'FINISHED',
      winnerId: data.placements?.[0]?.playerId ?? null,
    })
  },

  reset: () => {
    set(initialState)
  },
}))
