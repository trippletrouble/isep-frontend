import { useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useGameStore } from "../stores/game.store";
import { useUIStore } from "../stores/ui.store";
import {
  rollDice as rollDiceApi,
  createMove,
  submitQuizAnswer,
} from "../api/gameplay.api";

export function useGameActions() {
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  const rollDice = async (sessionId: string): Promise<void> => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      setIsRolling(true);
      const result = await rollDiceApi(sessionId);
      useGameStore.getState().setDiceResult(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Würfeln fehlgeschlagen";
      useUIStore
        .getState()
        .addToast({ type: "error", title: "Fehler beim Würfeln", message });
    } finally {
      setIsRolling(false);
    }
  };

  const moveFigure = async (
    sessionId: string,
    figureId: number,
    targetFieldId: number,
  ): Promise<void> => {
    if (sessionId === "sandbox" || window.location.pathname.endsWith("/sandbox")) {
      const storeState = useGameStore.getState();
      const possibleMoves = storeState.possibleMoves;
      const move = possibleMoves.find(m => m.figureId === figureId && m.toPosition === targetFieldId);
      const capturesOpponent = move?.capturesOpponent ?? false;

      if (capturesOpponent) {
        const opponent = storeState.figures.find(
          f => f.playerId !== storeState.currentPlayerId && f.position === targetFieldId
        );
        const attackerColor = storeState.players.find(p => p.id === storeState.currentPlayerId)?.color || "BLUE";
        const defenderColor = opponent ? (storeState.players.find(p => p.id === opponent.playerId)?.color || "RED") : "RED";

        storeState.setActiveQuiz({
          id: "quiz-sandbox",
          questionId: "q-sandbox",
          category: "Sandbox-Modus",
          questionText: `Zusammenstoß auf Feld ${targetFieldId}! Wer gewinnt das Duell?`,
          options: [
            { key: "A", text: "Angreifer gewinnt (Figur schlägt Gegner)" },
            { key: "B", text: "Verteidiger gewinnt (Angreifer fliegt raus!)" },
          ],
          attackerId: storeState.currentPlayerId!,
          defenderId: opponent?.playerId || "enemy-player-id",
          attackerColor,
          defenderColor,
          attackerAnswer: null,
          defenderAnswer: null,
          attackerCorrect: null,
          defenderCorrect: null,
          timeLimitSeconds: 15,
          pendingFigureId: figureId,
          pendingFromPos: move?.fromPosition ?? -1,
          pendingToPos: targetFieldId,
          diceValue: storeState.lastDiceValue ?? 1,
          createdAt: new Date().toISOString(),
        });
        return;
      }

      const nextFigures = storeState.figures.map(fig => {
        if (fig.id === figureId) {
          return {
            ...fig,
            position: targetFieldId,
            status: (targetFieldId === -1 ? "HOME" : "ACTIVE") as any,
          };
        }
        return fig;
      });

      const players = storeState.players;
      const currentIdx = players.findIndex(p => p.id === storeState.currentPlayerId);
      const nextIdx = (currentIdx + 1) % players.length;
      const nextPlayerId = players[nextIdx].id;
      const nextPlayers = players.map(p => ({
        ...p,
        isCurrentTurn: p.id === nextPlayerId
      }));

      storeState.setGameState({
        ...storeState.gameState!,
        currentPlayerId: nextPlayerId,
        players: nextPlayers,
        figures: nextFigures,
        diceRolledThisTurn: false,
        lastDiceValue: null,
      });

      useGameStore.setState({ possibleMoves: [] });
      return;
    }

    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      setIsMoving(true);
      const result = await createMove(sessionId, {
        figureId,
        toPosition: targetFieldId,
      });
      useGameStore.getState().setMoveResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Zug fehlgeschlagen";
      useUIStore
        .getState()
        .addToast({ type: "error", title: "Zug fehlgeschlagen", message });
    } finally {
      setIsMoving(false);
    }
  };

  const answerQuiz = async (
    sessionId: string,
    answer: "A" | "B" | "C" | "D",
  ): Promise<void> => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      setIsAnswering(true);
      const activeQuiz = useGameStore.getState().activeQuiz;

      const matchingAnswer =
        activeQuiz?.answers?.[["A", "B", "C", "D"].indexOf(answer)];
      const resolvedAnswerId = matchingAnswer ? matchingAnswer.id : answer;

      const result = await submitQuizAnswer(sessionId, {
        answerId: resolvedAnswerId,
      } as any);
      useGameStore.getState().setGameState(result.gameState || result);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Antwort konnte nicht übermittelt werden";
      useUIStore.getState().addToast({
        type: "error",
        title: "Übermittlung fehlgeschlagen",
        message,
      });
    } finally {
      setIsAnswering(false);
    }
  };

  return {
    rollDice,
    moveFigure,
    answerQuiz,
    isRolling,
    isMoving,
    isAnswering,
  };
}
