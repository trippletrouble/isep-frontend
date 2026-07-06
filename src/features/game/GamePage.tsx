import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Board from "../board/Board";
import { DicePanel } from "../dice/DicePanel";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { NotificationPanel, type NotificationData } from "./NotificationPanel";
import { PageSubHeader } from "@/components/layout/PageSubHeader";
import { useGameStore } from "@/stores/game.store";
import { useGameActions } from "@/hooks/useGameActions";
import { useAuthStore } from "@/stores";
import { useSSE } from "@/hooks/useSSE";
import { getSessionState, reconnectSession } from "@/api/sessions.api";
import {getPossibleMoves, getSessionResults} from "@/api/gameplay.api";
import type { GameResults } from "@/api/types";
import { QuizDuelView } from "../quiz-duel/QuizDuelView";
import { Trophy, Home } from "lucide-react";
import { DiceIcon, FigureIcon } from "@/components/icons/PhaseIcons";

export const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const gameState = useGameStore((state) => state.gameState);
  const lastDiceValue = useGameStore((state) => state.lastDiceValue);
  const activeQuiz = useGameStore((state) => state.activeQuiz);
  const setGameState = useGameStore((s) => s.setGameState);
  const handleQuizStarted = useGameStore((s) => s.handleQuizStarted);
  const handleQuizResolved = useGameStore((s) => s.handleQuizResolved);

  const { rollDice, answerQuiz } = useGameActions();

  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );
  const [results, setResults] = useState<GameResults[] | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const loadGame = async () => {
      try {
        const state = await getSessionState(id);
        if (!isMounted) return;

        setGameState(state);

        if (state.status === 'IN_PROGRESS' && state.diceRolledThisTurn && state.lastDiceValue) {
          const moves = await getPossibleMoves(id)
          useGameStore.getState().setPossibleMoves(moves.possibleMoves)
        }

        if (state.status === "IN_PROGRESS") {
          await reconnectSession(id);
        } else if (state.status === "FINISHED") {
          const res = await getSessionResults(id);
          if (isMounted) setResults(res);
        }
      } catch (err) {
        console.error("Failed to load game session", err);
      }
    };
    loadGame();

    return () => {
      isMounted = false;
    };
  }, [id, setGameState]);

  useEffect(() => {
    if (!id || results) return;
    if (gameState?.status === "FINISHED") {
      let isMounted = true;
      getSessionResults(id)
        .then((res) => {
          if (isMounted) setResults(res);
        })
        .catch((err) => console.error("Failed to load results", err));
      return () => {
        isMounted = false;
      };
    }
  }, [gameState?.status, id, results]);

  useEffect(() => {
    if (!notification) return;
    // const timer = setTimeout(() => setNotification(null), 5000);
    // return () => clearTimeout(timer);
  }, [notification]);

  useSSE(id || null, {
    onGameState: (data) => useGameStore.getState().handleGameStarted(data),
    onGameStarted: (data) => useGameStore.getState().handleGameStarted(data),
    onMoveExecuted: (data) => {
      useGameStore.getState().handleMoveExecuted(data);

      const outcome: unknown = data.outcome;
      let actionMsg = `Figur ${data.figureId} wurde bewegt.`;

      if (outcome === "CAPTURED") {
        actionMsg = `Figur ${data.figureId} wurde geschlagen!`;
      } else if (outcome === "GOAL") {
        actionMsg = `Figur ${data.figureId} ist im Ziel!`;
      } else if (outcome === "GAME_WON") {
        actionMsg = `Das Spiel wurde gewonnen!`;
      } else if (outcome === "QUIZ_STARTED") {
        actionMsg = `Ein Quiz-Duell hat begonnen!`;
      }

      setNotification({
        title:
          outcome === "CAPTURED"
            ? "SCHLAG!"
            : outcome === "GOAL"
              ? "ZIEL!"
              : outcome === "QUIZ_STARTED"
                ? "DUELL!"
                : "ZUG",
        message: actionMsg,
        iconType:
          outcome === "CAPTURED"
            ? "CAPTURE"
            : outcome === "QUIZ_STARTED"
              ? "QUIZ"
              : "INFO",
      });
    },
    onTurnChanged: (data) => {
      useGameStore.getState().handleTurnChanged(data);
    },
    onGameEnded: (data) => {
      useGameStore.getState().handleGameEnded(data);
    },
    onQuizStarted: (quizData) => {
      handleQuizStarted(quizData);
    },
    onQuizResolved: (finalGameState) => {
      handleQuizResolved(finalGameState);
      setNotification({
        title: "DUELL BEENDET",
        message: "Das Quiz-Duell wurde ausgewertet!",
        iconType: "QUIZ",
      });
    },
  });

  const isMyTurn = gameState && user && gameState.currentPlayerId === user.id;
  const canRoll = isMyTurn && !gameState.diceRolledThisTurn;

  const handleRoll = async () => {
    if (id) {
      await rollDice(id);
    }
  };

  const handleQuizAnswerSubmit = async (answer: "A" | "B" | "C" | "D") => {
    if (id) {
      await answerQuiz(id, answer);
    }
  };

  const gamePhase = !isMyTurn
    ? "warten"
    : !gameState?.diceRolledThisTurn
      ? "würfeln"
      : "bewegen";

  const phaseConfig = {
    warten: {
      label: "Warte auf anderen Spieler...",
      color: "text-white/40",
      icon: null,
    },
    würfeln: { label: "Würfeln!", color: "text-white", icon: DiceIcon },
    bewegen: { label: "Figur bewegen!", color: "text-white", icon: FigureIcon },
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-140px)] bg-primary flex flex-col items-center">
      <PageSubHeader center={`SPIEL #${id || ""}`} />

      <div className="fixed top-3 left-4 right-4 z-50 pointer-events-none lg:hidden">
        <div className="pointer-events-auto max-w-sm mx-auto">
          <NotificationPanel
            data={notification}
            onClose={() => setNotification(null)}
          />
        </div>
      </div>

      {gameState?.status === "FINISHED" && results && results.length > 0 && (
        <div className="absolute inset-0 bg-primary/95 z-50 flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
          <div className="max-w-md w-full bg-[#292929] border border-accent rounded-[40px] p-8 shadow-2xl flex flex-col items-center gap-6">
            <Trophy size={64} className="text-yellow animate-bounce" />
            <h2 className="font-lilita text-4xl text-center uppercase tracking-wide">
              Spiel Beendet
            </h2>
            <div className="w-full flex flex-col gap-3 my-4">
              {results[0]?.placements?.map((p) => (
                <div
                  key={p.playerId}
                  className="flex items-center justify-between bg-primary/50 border border-accent p-4 rounded-2xl"
                >
                  <span className="font-bold text-lg">
                    {p.rank}. {p.username}
                  </span>
                  <span className="text-accent font-bold">
                    {p.figuresInGoal} / 4 im Ziel
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full h-[60px] bg-green hover:opacity-90 text-primary font-lilita text-xl uppercase rounded-[20px] flex items-center justify-center gap-2 transition-all"
            >
              <Home size={20} />
              Hauptmenü
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[95vw] xl:max-w-[1600px] mx-auto flex flex-col p-2 lg:p-4 mt-4">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,380px)] gap-4 lg:gap-10 items-stretch justify-center">
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-full lg:hidden mb-4">
              <LeaderboardPanel />
            </div>

            <div className="w-full max-w-[min(90vw,90vh)] lg:max-w-[82vh] aspect-square flex-shrink-0">
              <Board diceRoll={lastDiceValue ?? 1} />
            </div>

            <div className="w-full lg:hidden mt-4">
              <DicePanel
                currentRoll={lastDiceValue}
                onRoll={handleRoll}
                disabled={!canRoll}
                phase={phaseConfig[gamePhase].label}
                PhaseIcon={phaseConfig[gamePhase].icon}
              />
            </div>
          </div>

          <div className="hidden lg:flex w-full flex-col h-full min-h-0 gap-4">
            <div className="w-full shrink-0">
              <LeaderboardPanel />
            </div>

            <div className="flex-1 flex flex-col justify-center w-full min-h-0">
              <NotificationPanel
                data={notification}
                onClose={() => setNotification(null)}
              />
            </div>

            <div className="w-full shrink-0">
              <DicePanel
                currentRoll={lastDiceValue}
                onRoll={handleRoll}
                disabled={!canRoll}
                phase={phaseConfig[gamePhase].label}
                PhaseIcon={phaseConfig[gamePhase].icon}
              />
            </div>
          </div>
        </div>
      </div>

      {activeQuiz && (
        <QuizDuelView
          key={activeQuiz.id || activeQuiz.questionId}
          open={Boolean(activeQuiz)}
          onOpenChange={(isOpen) => {
            if (!isOpen) useGameStore.getState().setActiveQuiz(null);
          }}
          activeQuiz={activeQuiz}
          currentUserId={user?.id || ""}
          onSubmitAnswer={handleQuizAnswerSubmit}
          onDuelResolved={(notificationData) => {
            setNotification(notificationData);
          }}
        />
      )}
    </div>
  );
};
