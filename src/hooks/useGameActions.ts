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
