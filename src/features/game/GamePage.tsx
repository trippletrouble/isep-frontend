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
import { getSessionResults } from "@/api/gameplay.api";
import type { GameResults } from "@/api/types";
import { QuizDuelView } from "../quiz-duel/QuizDuelView";
import { Trophy, Home, ShieldAlert } from "lucide-react";
import { DiceIcon, FigureIcon } from "@/components/icons/PhaseIcons";
import { toast } from "sonner";

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

  const isSandboxMode = id === "sandbox" || window.location.pathname.endsWith("/sandbox");

  useEffect(() => {
    if (!id || isSandboxMode) return;
    let isMounted = true;

    const loadGame = async () => {
      try {
        const state = await getSessionState(id);
        if (!isMounted) return;

        setGameState(state);
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
  }, [id, setGameState, isSandboxMode]);

  useEffect(() => {
    if (isSandboxMode || !id || results) return;
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
  }, [gameState?.status, id, results, isSandboxMode]);

  useEffect(() => {
    if (!notification) return;
    // const timer = setTimeout(() => setNotification(null), 5000);
    // return () => clearTimeout(timer);
  }, [notification]);

  // ==================== DEBUG MOCK BEGIN ======================
  useEffect(() => {
    if (!isSandboxMode) return;

    const mockUserId = user?.id || "mock-user-id";
    const redUserId = "red-player-id";
    const yellowUserId = "yellow-player-id";
    const greenUserId = "green-player-id";

    useGameStore.getState().setActiveQuiz(null);

    setGameState({
      sessionId: id || "debug-sandbox-lobby",
      status: "IN_PROGRESS",
      currentPlayerId: mockUserId,
      turnNumber: 1,
      diceRolledThisTurn: false,
      consecutiveSixes: 0,
      activeRules: ["QUIZ_DUELL", "PLAGUE_FLY"],
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      players: [
        {
          id: mockUserId,
          username: user?.username || "Du (Blau)",
          color: "BLUE",
          type: "HUMAN",
          isCurrentTurn: true,
          hasFinished: false,
          figuresInGoal: 0,
        },
        {
          id: redUserId,
          username: "Spieler Rot",
          color: "RED",
          type: "HUMAN",
          isCurrentTurn: false,
          hasFinished: false,
          figuresInGoal: 0,
        },
        {
          id: yellowUserId,
          username: "Spieler Gelb",
          color: "YELLOW",
          type: "HUMAN",
          isCurrentTurn: false,
          hasFinished: false,
          figuresInGoal: 0,
        },
        {
          id: greenUserId,
          username: "Spieler Grün",
          color: "GREEN",
          type: "HUMAN",
          isCurrentTurn: false,
          hasFinished: false,
          figuresInGoal: 0,
        },
      ],
      figures: [
        // Blue
        { id: 1, playerId: mockUserId, position: 10, status: "ACTIVE", hasPlagueFly: true, flyDebuffCount: 2 },
        { id: 2, playerId: mockUserId, position: -1, status: "HOME" },
        { id: 3, playerId: mockUserId, position: -1, status: "HOME" },
        { id: 4, playerId: mockUserId, position: -1, status: "HOME" },
        // Red
        { id: 5, playerId: redUserId, position: 11, status: "ACTIVE" },
        { id: 6, playerId: redUserId, position: -1, status: "HOME" },
        { id: 7, playerId: redUserId, position: -1, status: "HOME" },
        { id: 8, playerId: redUserId, position: -1, status: "HOME" },
        // Yellow
        { id: 9, playerId: yellowUserId, position: 24, status: "ACTIVE" },
        { id: 10, playerId: yellowUserId, position: -1, status: "HOME" },
        { id: 11, playerId: yellowUserId, position: -1, status: "HOME" },
        { id: 12, playerId: yellowUserId, position: -1, status: "HOME" },
        // Green
        { id: 13, playerId: greenUserId, position: 37, status: "ACTIVE" },
        { id: 14, playerId: greenUserId, position: -1, status: "HOME" },
        { id: 15, playerId: greenUserId, position: -1, status: "HOME" },
        { id: 16, playerId: greenUserId, position: -1, status: "HOME" },
      ],
    });

    useGameStore.setState({ lastDiceValue: null });
  }, [id, user, setGameState, isSandboxMode]);
  // ==================== DEBUG MOCK END ======================

  // Pass null to useSSE if debugging to stop streaming server data updates over your state
  useSSE(isSandboxMode ? null : id || null, {
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
    onPlagueFlyAcquired: (data) => {
      setNotification({
        title: "PESTFLIEGE! 🪰",
        message: `Eine Pestfliege hat die Figur ${data.figureId} befallen!`,
        iconType: "INFO",
      });
    },
    onPlagueFlyTransferred: (data) => {
      setNotification({
        title: "FLIEGE ÜBERTRAGEN! 🪰",
        message: `Die Pestfliege wurde von Figur ${data.fromFigureId} auf Figur ${data.toFigureId} übertragen!`,
        iconType: "INFO",
      });
    },
  });

  const isMyTurn = isSandboxMode
    ? true
    : gameState && user && gameState.currentPlayerId === user.id;

  const canRoll = isMyTurn && !gameState?.diceRolledThisTurn;

  const handleRoll = async (customValue?: number) => {
    if (isSandboxMode) {
      if (gameState) {
        const generatedRoll = customValue !== undefined ? customValue : Math.floor(Math.random() * 6) + 1;
        useGameStore.setState({ lastDiceValue: generatedRoll });

        const currentPlayerId = gameState.currentPlayerId || "mock-user-id";
        const currentPlayerColor = gameState.players.find(p => p.id === currentPlayerId)?.color || "BLUE";

        const startFields: Record<string, number> = {
          RED: 0,
          BLUE: 13,
          YELLOW: 26,
          GREEN: 39
        };
        const startField = startFields[currentPlayerColor] ?? 13;

        let updatedFigures = gameState.figures;
        const flyActive = gameState.activeRules?.includes("PLAGUE_FLY") ?? true;
        const activeFliesMap = new Map<number, number>();

        if (flyActive) {
          updatedFigures = updatedFigures.map((fig) => {
            if (fig.playerId === currentPlayerId && fig.hasPlagueFly) {
              const currentCount = fig.flyDebuffCount || 0;
              const nextCount = currentCount + 1;
              const debuffVal = Math.floor(Math.random() * 3) + 1;
              const effectiveRoll = Math.max(1, generatedRoll - debuffVal);
              activeFliesMap.set(fig.id, effectiveRoll);

              const shouldHeal = nextCount >= 3;
              return {
                ...fig,
                flyDebuffCount: shouldHeal ? 0 : nextCount,
                hasPlagueFly: !shouldHeal
              };
            }
            return fig;
          });
        }

        if (flyActive && generatedRoll === 1) {
          const totalActiveFlies = updatedFigures.filter(f => f.hasPlagueFly).length;
          if (totalActiveFlies < 3) {
            const goalStartPositions = [52, 57, 62, 67];
            const eligible = updatedFigures.find(
              (f) => {
                if (f.playerId !== currentPlayerId) return false;
                if (f.status !== "ACTIVE" || f.position === -1) return false;
                if (f.hasPlagueFly) return false;
                if (f.position >= 72) return false;
                const isInGoalLane = goalStartPositions.some(
                  (start) => f.position >= start && f.position < start + 5
                );
                return !isInGoalLane;
              }
            );

            if (eligible) {
              updatedFigures = updatedFigures.map((f) => {
                if (f.id === eligible.id) {
                  return {
                    ...f,
                    hasPlagueFly: true,
                    flyDebuffCount: 0
                  };
                }
                return f;
              });
              toast.info(`Eine Pestfliege hat Figur ${eligible.id} infiziert!`);
            }
          }
        }

        const moves: any[] = [];
        updatedFigures.forEach((fig) => {
          if (fig.playerId !== currentPlayerId) return;

          const figRoll = activeFliesMap.has(fig.id) ? activeFliesMap.get(fig.id)! : generatedRoll;

          if (fig.status === "HOME" || fig.position === -1) {
            if (generatedRoll === 6) {
              moves.push({
                figureId: fig.id,
                fromPosition: -1,
                toPosition: startField,
                capturesOpponent: updatedFigures.some(
                  (f) => f.playerId !== currentPlayerId && f.position === startField
                ),
              });
            }
          } else {
            const nextPos = (fig.position + figRoll) % 52;
            moves.push({
              figureId: fig.id,
              fromPosition: fig.position,
              toPosition: nextPos,
              capturesOpponent: updatedFigures.some(
                (f) => f.playerId !== currentPlayerId && f.position === nextPos
              ),
            });
          }
        });

        // Set the state
        setGameState({
          ...gameState,
          lastDiceValue: generatedRoll,
          figures: updatedFigures,
          diceRolledThisTurn: true,
        });
        useGameStore.getState().setPossibleMoves(moves);

        if (moves.length === 0) {
          toast.info(`Keine Züge möglich mit einer ${generatedRoll}. Nächster Spieler!`);

          const players = gameState.players;
          const currentIdx = players.findIndex(p => p.id === currentPlayerId);
          const nextIdx = (currentIdx + 1) % players.length;
          const nextPlayerId = players[nextIdx].id;
          const nextPlayers = players.map(p => ({
            ...p,
            isCurrentTurn: p.id === nextPlayerId
          }));

          setTimeout(() => {
            setGameState({
              ...gameState,
              currentPlayerId: nextPlayerId,
              players: nextPlayers,
              diceRolledThisTurn: false,
              lastDiceValue: null,
            });
          }, 2000);
        }
      }
      return;
    }

    if (id) {
      await rollDice(id);
    }
  };

  const handleQuizAnswerSubmit = async (answer: "A" | "B" | "C" | "D") => {
    if (isSandboxMode) {
      if (!activeQuiz) return;

      const evaluatedQuiz = {
        ...activeQuiz,
        attackerAnswer: answer,
        defenderAnswer: "B" as const,
        attackerCorrect: answer === "A",
        defenderCorrect: false,
      };

      useGameStore.setState({ activeQuiz: evaluatedQuiz });

      setTimeout(() => {
        setNotification({
          title: "DUELL BEENDET",
          message:
            answer === "A"
              ? "Der Angreifer hat das Quiz-Duell gewonnen!"
              : "Der Verteidiger hat das Quiz-Duell gewonnen!",
          iconType: "INFO",
        });

        const storeState = useGameStore.getState();
        const pendingFigId = activeQuiz.pendingFigureId;
        const targetPos = activeQuiz.pendingToPos;
        const fromPos = activeQuiz.pendingFromPos;

        let nextFigures = storeState.figures;

        if (answer === "A") {
          const defenderFig = storeState.figures.find(
            (fig) => fig.playerId !== storeState.currentPlayerId && fig.position === targetPos
          );
          const attackerFig = storeState.figures.find((fig) => fig.id === pendingFigId);

          let nextAttackerFly = attackerFig?.hasPlagueFly ?? false;
          let nextDefenderFly = defenderFig?.hasPlagueFly ?? false;

          if (attackerFig && defenderFig) {
            if (attackerFig.hasPlagueFly && defenderFig.hasPlagueFly) {
              nextAttackerFly = false;
              nextDefenderFly = false;
              toast.info("Beide Figuren waren infiziert. Die Pestfliegen fliegen weg!");
            } else if (defenderFig.hasPlagueFly) {
              nextAttackerFly = true;
              nextDefenderFly = false;
              toast.info("Pestfliege wurde auf den Angreifer übertragen!");
            } else if (attackerFig.hasPlagueFly) {
              nextAttackerFly = false;
              toast.info("Der Angreifer hat seine Pestfliege verloren!");
            }
          }

          nextFigures = storeState.figures.map(fig => {
            if (fig.playerId !== storeState.currentPlayerId && fig.position === targetPos) {
              return {
                ...fig,
                position: -1,
                status: "HOME" as const,
                hasPlagueFly: nextDefenderFly,
                flyDebuffCount: 0
              };
            }
            if (fig.id === pendingFigId) {
              return {
                ...fig,
                position: targetPos,
                status: "ACTIVE" as const,
                hasPlagueFly: nextAttackerFly,
                flyDebuffCount: nextAttackerFly ? (attackerFig?.flyDebuffCount ?? 0) : 0
              };
            }
            return fig;
          });
        } else {
          nextFigures = storeState.figures.map(fig => {
            if (fig.id === pendingFigId) {
              return { ...fig, position: fromPos, status: (fromPos === -1 ? "HOME" : "ACTIVE") as any };
            }
            return fig;
          });
        }

        const players = storeState.players;
        const currentIdx = players.findIndex(p => p.id === storeState.currentPlayerId);
        const nextIdx = (currentIdx + 1) % players.length;
        const nextPlayerId = players[nextIdx].id;
        const nextPlayers = players.map(p => ({
          ...p,
          isCurrentTurn: p.id === nextPlayerId
        }));

        setGameState({
          ...storeState.gameState!,
          currentPlayerId: nextPlayerId,
          players: nextPlayers,
          figures: nextFigures,
          diceRolledThisTurn: false,
        });

        useGameStore.setState({ activeQuiz: null });
      }, 3000);

      return;
    }

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
      <PageSubHeader
        center={
          isSandboxMode ? "🛠 SANDBOX DESIGN DEBUGGER" : `SPIEL #${id || ""}`
        }
      />

      {isSandboxMode && (
        <div className="w-full bg-yellow text-primary py-1 px-4 text-center font-bold text-xs flex items-center justify-center gap-2 tracking-wide uppercase shrink-0 select-none">
          <ShieldAlert size={14} /> Sandbox Modus aktiv — Backend-Streaming
          unterdrückt
        </div>
      )}

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

      {/* Layout Wrapper */}
      <div className="w-full max-w-[95vw] xl:max-w-[1600px] mx-auto flex flex-col p-2 md:p-4 mt-4">
        <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_minmax(280px,360px)] gap-4 md:gap-8 items-stretch justify-center">
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-full md:hidden mb-4">
              <LeaderboardPanel />
            </div>

            <div className="w-full max-w-[min(90vw,60vh)] md:max-w-[78vh] aspect-square flex-shrink-0">
              <Board diceRoll={lastDiceValue ?? 1} />
            </div>

            <div className="w-full md:hidden mt-4">
              <DicePanel
                currentRoll={lastDiceValue}
                onRoll={handleRoll}
                disabled={!canRoll}
                phase={phaseConfig[gamePhase].label}
                PhaseIcon={phaseConfig[gamePhase].icon}
              />
            </div>
          </div>

          {/* RECHTER CONTAINER (Desktop Side Panel) */}
          <div className="hidden md:flex w-full flex-col justify-center gap-6">
            <LeaderboardPanel />

            <div className="h-14 w-full flex-shrink-0 flex items-center justify-center">
              <div
                className={`w-full transition-all duration-300 ease-in-out ${
                  notification
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <NotificationPanel
                  data={notification}
                  onClose={() => setNotification(null)}
                />
              </div>
            </div>

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

      {activeQuiz && (
        <QuizDuelView
          key={activeQuiz.questionText}
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
