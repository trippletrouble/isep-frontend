import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "./game.store";
import type { GameState, PossibleMove } from "../api/types";

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  const dummyGameState: GameState = {
    sessionId: "session-1",
    status: "IN_PROGRESS",
    mode: "CLASSIC",
    boardTheme: "CLASSIC",
    players: [
      {
        id: "p1",
        username: "Alice",
        color: "RED",
        type: "HUMAN",
        isCurrentTurn: true,
        hasFinished: false,
        figuresInGoal: 0,
      },
      {
        id: "p2",
        username: "Bob",
        color: "BLUE",
        type: "HUMAN",
        isCurrentTurn: false,
        hasFinished: false,
        figuresInGoal: 0,
      },
    ],
    figures: [
      {
        id: 1,
        playerId: "p1",
        position: -1,
        status: "HOME",
        color: "RED",
      },
      {
        id: 2,
        playerId: "p1",
        position: 0,
        status: "ACTIVE",
        color: "RED",
      },
    ],
    currentPlayerId: "p1",
    turnNumber: 1,
    lastDiceValue: null,
    diceRolledThisTurn: false,
    consecutiveSixes: 0,
    activeRules: [],
    winnerId: null,
    createdAt: "now",
    lastUpdatedAt: "now",
  };

  it("should have initial state", () => {
    const state = useGameStore.getState();
    expect(state.gameState).toBeNull();
    expect(state.figures).toEqual([]);
    expect(state.players).toEqual([]);
    expect(state.currentPlayerId).toBeNull();
    expect(state.lastDiceValue).toBeNull();
    expect(state.diceRolledThisTurn).toBe(false);
    expect(state.possibleMoves).toEqual([]);
    expect(state.consecutiveSixes).toBe(0);
    expect(state.status).toBeNull();
    expect(state.winnerId).toBeNull();
    expect(state.turnNumber).toBe(0);
    expect(state.activeQuiz).toBeNull();
    expect(state.selectedFigureId).toBeNull();
  });

  it("should select figure id", () => {
    useGameStore.getState().setSelectedFigureId("fig-1");
    expect(useGameStore.getState().selectedFigureId).toBe("fig-1");
  });

  it("should set game state correctly", () => {
    useGameStore.getState().setGameState(dummyGameState);
    const state = useGameStore.getState();
    expect(state.gameState).toEqual(dummyGameState);
    expect(state.figures).toEqual(dummyGameState.figures);
    expect(state.players).toEqual(dummyGameState.players);
    expect(state.currentPlayerId).toBe("p1");
    expect(state.status).toBe("IN_PROGRESS");
  });

  it("should set dice result", () => {
    useGameStore.getState().setGameState(dummyGameState);

    const diceResult = {
      value: 6,
      playerId: "p1",
      hasMoves: true,
      rollAgain: true,
      turnForfeit: false,
      gameState: {
        ...dummyGameState,
        lastDiceValue: 6,
        diceRolledThisTurn: true,
        consecutiveSixes: 1,
      },
      possibleMoves: [
        {
          figureId: 1,
          fromPosition: -1,
          toPosition: 0,
          outcome: "LEAVE_HOME" as const,
        },
      ],
      consecutiveSixes: 1,
    };

    useGameStore.getState().setDiceResult(diceResult);

    const state = useGameStore.getState();
    expect(state.lastDiceValue).toBe(6);
    expect(state.possibleMoves).toEqual(diceResult.possibleMoves);
    expect(state.consecutiveSixes).toBe(1);
    expect(state.gameState?.lastDiceValue).toBe(6);
  });

  describe("setMoveResult", () => {
    it("should process move result with server gameState", () => {
      useGameStore.getState().setGameState(dummyGameState);
      const nextGameState = { ...dummyGameState, turnNumber: 2 };
      const moveResult = {
        figureId: 2,
        fromPosition: 0,
        toPosition: 3,
        outcome: "MOVED" as const,
        gameState: nextGameState,
      };

      useGameStore.getState().setMoveResult(moveResult);

      const state = useGameStore.getState();
      expect(state.gameState).toEqual(nextGameState);
      expect(state.possibleMoves).toEqual([]);
      expect(state.diceRolledThisTurn).toBe(false);
    });

    it("should compute figure updates locally if server gameState is missing", () => {
      useGameStore.getState().setGameState(dummyGameState);

      // 1. Move to Goal
      const moveGoal = {
        figureId: 2,
        fromPosition: 55,
        toPosition: 56,
        outcome: "GOAL" as const,
      } as any;
      useGameStore.getState().setMoveResult(moveGoal);
      let fig = useGameStore.getState().figures.find((f) => f.id === 2);
      expect(fig?.position).toBe(56);
      expect(fig?.status).toBe("GOAL");

      // 2. Sent back Home (e.g. captured or plague fly penalty)
      const moveHome = {
        figureId: 2,
        fromPosition: 56,
        toPosition: -1,
        outcome: "CAPTURED" as const,
      } as any;
      useGameStore.getState().setMoveResult(moveHome);
      fig = useGameStore.getState().figures.find((f) => f.id === 2);
      expect(fig?.position).toBe(-1);
      expect(fig?.status).toBe("HOME");

      // 3. Regular active move
      const moveActive = {
        figureId: 2,
        fromPosition: -1,
        toPosition: 0,
        outcome: "LEAVE_HOME" as const,
      } as any;
      useGameStore.getState().setMoveResult(moveActive);
      fig = useGameStore.getState().figures.find((f) => f.id === 2);
      expect(fig?.position).toBe(0);
      expect(fig?.status).toBe("ACTIVE");
    });
  });

  it("should set and clear possible moves", () => {
    const moves: PossibleMove[] = [
      { figureId: 1, fromPosition: 0, toPosition: 2, outcome: "MOVED" },
    ];
    useGameStore.getState().setPossibleMoves(moves);
    expect(useGameStore.getState().possibleMoves).toEqual(moves);

    useGameStore.getState().clearPossibleMoves();
    expect(useGameStore.getState().possibleMoves).toEqual([]);
  });

  it("should handle game started trigger", () => {
    useGameStore.getState().handleGameStarted(dummyGameState);
    expect(useGameStore.getState().gameState).toEqual(dummyGameState);
  });

  it("should handle move executed trigger", () => {
    useGameStore.getState().setGameState(dummyGameState);
    const nextGameState = { ...dummyGameState, turnNumber: 2 };
    useGameStore.getState().handleMoveExecuted({
      figureId: 2,
      fromPosition: 0,
      toPosition: 3,
      outcome: "MOVED",
      gameState: nextGameState,
    });
    expect(useGameStore.getState().gameState).toEqual(nextGameState);
  });

  it("should handle turn changed trigger and update players isCurrentTurn", () => {
    useGameStore.getState().setGameState(dummyGameState);

    useGameStore.getState().handleTurnChanged({
      currentPlayerId: "p2",
      turnNumber: 2,
    });

    const state = useGameStore.getState();
    expect(state.currentPlayerId).toBe("p2");
    expect(state.turnNumber).toBe(2);
    expect(state.diceRolledThisTurn).toBe(false);
    expect(state.consecutiveSixes).toBe(0);

    // Players turn status should update
    const p1 = state.players.find((p) => p.id === "p1");
    const p2 = state.players.find((p) => p.id === "p2");
    expect(p1?.isCurrentTurn).toBe(false);
    expect(p2?.isCurrentTurn).toBe(true);
  });

  it("should handle game ended trigger", () => {
    useGameStore.getState().setGameState(dummyGameState);
    useGameStore.getState().handleGameEnded({
      sessionId: "session-1",
      placements: [
        {
          rank: 1,
          playerId: "p2",
          username: "Bob",
          color: "BLUE",
          figuresInGoal: 4,
          figuresCaptured: 0,
        },
        {
          rank: 2,
          playerId: "p1",
          username: "Alice",
          color: "RED",
          figuresInGoal: 0,
          figuresCaptured: 0,
        },
      ],
      finishedAt: "now",
    });

    const state = useGameStore.getState();
    expect(state.status).toBe("FINISHED");
    expect(state.winnerId).toBe("p2");
  });

  it("should handle quiz started and quiz resolved", () => {
    const dummyQuiz = {
      duelId: "quiz-1",
      challengerId: "p1",
      opponentId: "p2",
      currentQuestion: {
        id: "q-1",
        questionText: "What is 2 + 2?",
        options: ["3", "4", "5"],
      },
      challengerAnswered: false,
      opponentAnswered: false,
      expiresAt: "later",
    };

    useGameStore.getState().handleQuizStarted(dummyQuiz as any);

    let state = useGameStore.getState();
    expect(state.activeQuiz).toEqual(dummyQuiz);
    expect(state.status).toBe("QUIZ_PENDING");

    // Manually setting active quiz
    useGameStore.getState().setActiveQuiz(null);
    expect(useGameStore.getState().activeQuiz).toBeNull();

    // Resolving quiz
    useGameStore.getState().handleQuizStarted(dummyQuiz as any);
    useGameStore.getState().handleQuizResolved(dummyGameState);

    state = useGameStore.getState();
    expect(state.activeQuiz).toBeNull();
    expect(state.gameState).toEqual(dummyGameState);
  });
});
