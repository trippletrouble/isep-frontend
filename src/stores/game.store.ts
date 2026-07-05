import { create } from "zustand";
import type {
  GameState,
  Figure,
  Player,
  PossibleMove,
  DiceRollResult,
  MoveResult,
  GameResults,
  GameStatus,
  PieceStatus,
  ActiveQuizType,
} from "../api/types";

interface GameStoreState {
  gameState: GameState | null;
  figures: Figure[];
  players: Player[];
  currentPlayerId: string | null;
  lastDiceValue: number | null;
  diceRolledThisTurn: boolean;
  possibleMoves: PossibleMove[];
  consecutiveSixes: number;
  status: GameStatus | null;
  winnerId: string | null;
  turnNumber: number;
  isLoading: boolean;
  error: string | null;

  activeQuiz: ActiveQuizType | null;

  setGameState: (state: GameState) => void;
  setDiceResult: (result: DiceRollResult) => void;
  setMoveResult: (result: MoveResult) => void;
  setPossibleMoves: (moves: PossibleMove[]) => void;
  clearPossibleMoves: () => void;
  handleGameStarted: (data: GameState) => void;
  handleMoveExecuted: (data: MoveResult) => void;
  handleTurnChanged: (data: {
    currentPlayerId: string;
    turnNumber: number;
  }) => void;
  handleGameEnded: (data: GameResults) => void;

  handleQuizStarted: (quiz: ActiveQuizType) => void;
  handleQuizResolved: (finalGameState: GameState) => void;

  reset: () => void;
  setActiveQuiz: (quiz: ActiveQuizType | null) => void;
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
  activeQuiz: null,
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  ...initialState,

  setGameState: (inputState: GameState) => {
    set((current) => {
      const state = (inputState as any).data
        ? (inputState as any).data
        : inputState;

      // 🛡️ RACE CONDITION SHIELD: Block outdated SSE packets from wiping the quiz
      const isCurrentlyInQuiz =
        current.status === "QUIZ_PENDING" && current.activeQuiz !== null;
      const incomingHasQuiz = !!state.activeQuiz;

      let mergedQuiz: ActiveQuizType | null = null;

      if (incomingHasQuiz) {
        const rawAnswers =
          state.activeQuiz?.answers || current.activeQuiz?.answers || [];
        const rawOptions =
          state.activeQuiz?.options || current.activeQuiz?.options || [];

        mergedQuiz = {
          ...state.activeQuiz,
          question:
            state.activeQuiz.question ||
            state.activeQuiz.questionText ||
            current.activeQuiz?.question ||
            "Lade Frage...",
          category:
            state.activeQuiz.category ||
            current.activeQuiz?.category ||
            "Allgemeinwissen",
          answers:
            rawAnswers.length > 0
              ? rawAnswers
              : rawOptions.map((o) => ({ id: o.key, text: o.text })),
          options:
            rawOptions.length > 0
              ? rawOptions
              : rawAnswers.map((a, i) => ({
                  key: ["A", "B", "C", "D"][i] as any,
                  text: a.text,
                })),
        };
      } else if (isCurrentlyInQuiz && state.status !== "FINISHED") {
        mergedQuiz = current.activeQuiz;
      }

      const finalStatus =
        isCurrentlyInQuiz && !incomingHasQuiz && state.status !== "FINISHED"
          ? "QUIZ_PENDING"
          : state.status;

      return {
        gameState: state,
        figures: state.figures || [],
        players: state.players || [],
        currentPlayerId: state.currentPlayerId || null,
        lastDiceValue: state.lastDiceValue ?? null,
        diceRolledThisTurn: !!state.diceRolledThisTurn,
        consecutiveSixes: state.consecutiveSixes || 0,
        status: finalStatus || null,
        winnerId: state.winnerId ?? null,
        turnNumber: state.turnNumber || 0,
        activeQuiz: mergedQuiz,
        possibleMoves: [],
      };
    });
  },

  setDiceResult: (inputResult: DiceRollResult) => {
    const result = (inputResult as any).data
      ? (inputResult as any).data
      : inputResult;
    get().setGameState(result.gameState);
    set({
      lastDiceValue: result.value,
      possibleMoves: result.possibleMoves || [],
      consecutiveSixes: result.consecutiveSixes || 0,
    });
  },

  setMoveResult: (inputResult: MoveResult) => {
    const result = (inputResult as any).data
      ? (inputResult as any).data
      : inputResult;

    if (result.outcome === "QUIZ_STARTED") {
      set((state) => {
        const currentGameState = result.gameState || state.gameState;
        const rawQuiz = (result as any).quiz || {};
        const dbQuiz = currentGameState?.activeQuiz;

        const quizText =
          rawQuiz.question ||
          dbQuiz?.questionText ||
          state.activeQuiz?.question ||
          "Frage wird geladen...";
        const quizAnswers = rawQuiz.answers || [];

        // 🛡️ UNBREAKABLE INITIALIZATION: Construct the object by force so the modal CANNOT fail to open.
        const forcefullyMergedQuiz: ActiveQuizType = {
          id: dbQuiz?.id || state.activeQuiz?.id || `temp-${Date.now()}`,
          questionId: rawQuiz.questionId || dbQuiz?.questionId || "temp-q",
          question: quizText,
          questionText: quizText,
          category:
            rawQuiz.category ||
            dbQuiz?.category ||
            state.activeQuiz?.category ||
            "Allgemeinwissen",
          answers:
            quizAnswers.length > 0
              ? quizAnswers.map((a: any) => ({ id: a.id, text: a.text }))
              : dbQuiz?.answers || [],
          options:
            quizAnswers.length > 0
              ? quizAnswers.map((a: any, i: number) => ({
                  key: ["A", "B", "C", "D"][i] as any,
                  text: a.text,
                }))
              : dbQuiz?.options || [],
          attackerId: dbQuiz?.attackerId || state.currentPlayerId || "",
          defenderId: dbQuiz?.defenderId || "",
          attackerColor: dbQuiz?.attackerColor || "BLUE",
          defenderColor: dbQuiz?.defenderColor || "RED",
          attackerAnswer: dbQuiz?.attackerAnswer || null,
          defenderAnswer: dbQuiz?.defenderAnswer || null,
          attackerCorrect: dbQuiz?.attackerCorrect || null,
          defenderCorrect: dbQuiz?.defenderCorrect || null,
          timeLimitSeconds:
            rawQuiz.timeLimitSeconds || dbQuiz?.timeLimitSeconds || 15,
          pendingFigureId: result.figureId,
          pendingFromPos: result.fromPosition,
          pendingToPos: result.toPosition,
          diceValue: state.lastDiceValue || 0,
          createdAt: dbQuiz?.createdAt || new Date().toISOString(),
        };

        const updatedGameState = currentGameState
          ? {
              ...currentGameState,
              status: "QUIZ_PENDING" as const,
              activeQuiz: forcefullyMergedQuiz,
            }
          : null;

        return {
          gameState: updatedGameState,
          figures: result.gameState?.figures || state.figures,
          players: result.gameState?.players || state.players,
          status: "QUIZ_PENDING",
          activeQuiz: forcefullyMergedQuiz, // Set forcefully. The modal will open instantly.
          possibleMoves: [],
          diceRolledThisTurn: false,
        };
      });
      return;
    }

    if (result.gameState) {
      get().setGameState(result.gameState);
      set({ possibleMoves: [], diceRolledThisTurn: false });
      return;
    }

    set((state) => {
      const updatedFigures = state.figures.map((fig) => {
        if (fig.id === result.figureId) {
          const newStatus = (
            result.outcome === "GOAL"
              ? "GOAL"
              : result.toPosition === -1
                ? "HOME"
                : "ACTIVE"
          ) as PieceStatus;
          return {
            ...fig,
            position: result.toPosition ?? fig.position,
            status: newStatus,
          };
        }
        return fig;
      });

      return {
        figures: updatedFigures,
        gameState: state.gameState
          ? { ...state.gameState, figures: updatedFigures }
          : null,
        possibleMoves: [],
        diceRolledThisTurn: false,
      };
    });
  },

  setPossibleMoves: (moves: PossibleMove[]) => {
    set({ possibleMoves: moves || [] });
  },
  clearPossibleMoves: () => {
    set({ possibleMoves: [] });
  },

  handleGameStarted: (inputData: GameState) => {
    const data = (inputData as any).data ? (inputData as any).data : inputData;
    get().setGameState(data);
  },

  handleMoveExecuted: (inputData: MoveResult) => {
    const data = (inputData as any).data ? (inputData as any).data : inputData;
    get().setMoveResult(data);
  },

  handleTurnChanged: (inputData: {
    currentPlayerId: string;
    turnNumber: number;
  }) => {
    const data = (inputData as any).data ? (inputData as any).data : inputData;
    set((state) => {
      const updatedPlayers =
        state.gameState?.players?.map((player) => ({
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
        gameState: state.gameState
          ? {
              ...state.gameState,
              currentPlayerId: data.currentPlayerId,
              turnNumber: data.turnNumber,
              diceRolledThisTurn: false,
              consecutiveSixes: 0,
              players: updatedPlayers,
            }
          : null,
      };
    });
  },

  handleGameEnded: (inputData: GameResults) => {
    const data = (inputData as any).data ? (inputData as any).data : inputData;
    set({
      status: "FINISHED",
      winnerId: data.placements?.[0]?.playerId ?? null,
    });
  },

  handleQuizStarted: (inputQuiz: ActiveQuizType) => {
    const quiz = (inputQuiz as any).data ? (inputQuiz as any).data : inputQuiz;
    set((current) => {
      const resolvedText =
        quiz.question ||
        quiz.questionText ||
        current.activeQuiz?.question ||
        "Lade Frage...";
      const resolvedCategory =
        quiz.category || current.activeQuiz?.category || "Allgemeinwissen";

      const rawAnswers = quiz.answers || current.activeQuiz?.answers || [];
      const rawOptions = quiz.options || current.activeQuiz?.options || [];

      const answers =
        rawAnswers.length > 0
          ? rawAnswers
          : rawOptions.map((o) => ({ id: o.key, text: o.text }));
      const options =
        rawOptions.length > 0
          ? rawOptions
          : rawAnswers.map((a, i) => ({
              key: ["A", "B", "C", "D"][i] as any,
              text: a.text,
            }));

      const mergedQuiz: ActiveQuizType = {
        ...current.activeQuiz,
        ...quiz,
        question: resolvedText,
        questionText: resolvedText,
        category: resolvedCategory,
        answers,
        options,
      };

      return { activeQuiz: mergedQuiz, status: "QUIZ_PENDING" };
    });
  },

  handleQuizResolved: (inputGameState: GameState) => {
    const finalGameState = (inputGameState as any).data
      ? (inputGameState as any).data
      : inputGameState;
    get().setGameState(finalGameState);
    set({ activeQuiz: null, status: finalGameState.status });
  },

  setActiveQuiz: (quiz) => {
    set({ activeQuiz: quiz });
  },
  reset: () => {
    set(initialState);
  },
}));
