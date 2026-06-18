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
    get().setGameState(result.gameState) // setzt diceRolledThisTurn korrekt aus gameState
    set({
      lastDiceValue: result.value,
      possibleMoves: result.possibleMoves,
      consecutiveSixes: result.consecutiveSixes,
    })
  },

  setMoveResult: (result: MoveResult) => {
    // Wenn das Backend den kompletten State mitschickt, nutzen wir den
    if (result.gameState) {
      get().setGameState(result.gameState);
      set({
        possibleMoves: [],
        diceRolledThisTurn: false,
      });
      return;
    }

    // --- FIX: Wenn kein gameState da ist, updaten wir die Figur händisch! ---
    set((state) => {
      // 1. Finde und aktualisiere die Figur im globalen figures-Array
      const updatedFigures = state.figures.map((fig) => {
        // Prüfe, ob die IDs matchen (Achtung: Manchmal ist eins Number und eins String, daher ==)
        if (fig.id == result.figureId) {
          return {
            ...fig,
            position: result.toPosition ?? fig.position, // Die neue Position vom Backend
            status: result.outcome === 'GOAL' ? 'GOAL' : (result.toPosition === -1 ? 'HOME' : 'ACTIVE')
          };
        }

        // Optionale Zusatz-Logik: Wurde diese Figur geschlagen? 
        // Falls dein Backend eine 'wasCapturedId' oder ähnliches im result mitschickt,
        // müsste man die hier auf position: -1 zurücksetzen.

        return fig;
      });

      // 2. Baue den neuen GameState zusammen, damit das Board ihn sauber rendert
      const updatedGameState = state.gameState ? {
        ...state.gameState,
        figures: updatedFigures,
      } : null;

      return {
        figures: updatedFigures,
        gameState: updatedGameState,
        possibleMoves: [],
        diceRolledThisTurn: false,
      };
    });
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
    set((state) => {
      const updatedPlayers = state.gameState?.players?.map((player) => ({
        ...player,
        isCurrentTurn: player.id === data.currentPlayerId,
      })) || [];

      return {
        currentPlayerId: data.currentPlayerId,
        turnNumber: data.turnNumber,
        diceRolledThisTurn: false,
        possibleMoves: [],
        consecutiveSixes: 0,
        players: updatedPlayers,
        gameState: state.gameState ? {
          ...state.gameState,
          currentPlayerId: data.currentPlayerId,
          turnNumber: data.turnNumber,
          diceRolledThisTurn: false,
          consecutiveSixes: 0,
          players: updatedPlayers,
        } : null,
      };
    });
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
