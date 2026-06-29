import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Board from "../board/Board";
import { DicePanel } from "../dice/DicePanel";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { NotificationPanel, type NotificationData } from "./NotificationPanel";
import { PageSubHeader } from "@/components/layout/PageSubHeader";
import { useGameStore } from "@/stores/game.store";
import { useGameActions } from "@/hooks/useGameActions";
import { useAuthStore } from "@/stores/auth.store";
import { useSSE } from "@/hooks/useSSE";
import { getSessionState, reconnectSession } from "@/api/sessions.api";
import { getSessionResults } from "@/api/gameplay.api";
import type { GameResults } from "@/api/types";
import { Trophy, Home } from "lucide-react";

export const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const gameState = useGameStore((state) => state.gameState);
  const lastDiceValue = useGameStore((state) => state.lastDiceValue);
  const setGameState = useGameStore((s) => s.setGameState);
  const { rollDice } = useGameActions();

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
    if (gameState?.status === "FINISHED" && id && !results) {
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
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  useSSE(id || null, {
    onGameState: (data) => useGameStore.getState().handleGameStarted(data),
    onGameStarted: (data) => useGameStore.getState().handleGameStarted(data),
    onMoveExecuted: (data) => {
      useGameStore.getState().handleMoveExecuted(data);
      let actionMsg = `Figur ${data.figureId} wurde bewegt.`;
      if (data.outcome === "CAPTURED") {
        actionMsg = `Figur ${data.figureId} wurde geschlagen!`;
      } else if (data.outcome === "GOAL") {
        actionMsg = `Figur ${data.figureId} ist im Ziel!`;
      } else if (data.outcome === "GAME_WON") {
        actionMsg = `Das Spiel wurde gewonnen!`;
      }
      setNotification({
        title:
          data.outcome === "CAPTURED"
            ? "SCHLAG!"
            : data.outcome === "GOAL"
              ? "ZIEL!"
              : "ZUG",
        message: actionMsg,
        iconType:
          data.outcome === "CAPTURED"
            ? "CAPTURE"
            : data.outcome === "GAME_WON"
              ? "WIN"
              : "INFO",
      });
    },
    onTurnChanged: (data) => {
      useGameStore.getState().handleTurnChanged(data);
    },
    onGameEnded: (data) => {
      useGameStore.getState().handleGameEnded(data);
    },
  });

  const isMyTurn = gameState && user && gameState.currentPlayerId === user.id;
  const canRoll = isMyTurn && !gameState.diceRolledThisTurn;

  const handleRoll = () => {
    if (id) rollDice(id);
  };

  const gamePhase = !isMyTurn
    ? "warten"
    : !gameState?.diceRolledThisTurn
      ? "würfeln"
      : "bewegen";

  const phaseConfig = {
    warten: { label: "Warte auf anderen Spieler...", color: "text-white/40" },
    würfeln: { label: "🎲 Würfeln!", color: "text-white" },
    bewegen: { label: "♟ Figur bewegen!", color: "text-white" },
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-primary flex flex-col items-center">
      <PageSubHeader center={`SPIEL #${id || ""}`} />

      {/* Mobile Notification */}
      <div className="fixed top-3 left-4 right-4 z-50 pointer-events-none lg:hidden">
        <div className="pointer-events-auto max-w-sm mx-auto">
          <NotificationPanel
            data={notification}
            onClose={() => setNotification(null)}
          />
        </div>
      </div>

      {/* Game Over Overlay */}
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
      <div className="w-full max-w-[95vw] xl:max-w-[1600px] mx-auto flex flex-col p-2 lg:p-4 mt-4">
        {/* CSS-Grid Spielfeld-Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,380px)] gap-4 lg:gap-10 items-stretch justify-center">
          {/* LINKER CONTAINER: Spielfeld */}
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-full lg:hidden mb-4">
              <LeaderboardPanel />
            </div>

            {/* SPIELBRETT-CONTAINER:
          Nutzt auf Mobile max 90vw/90vh. Auf Desktop (lg:) heben wir die restriktive 
          Kombination auf und erlauben ihm, sich bis zu einer gesunden vertikalen Grenze (82vh) 
          maximal aufzublasen, um die linke Spalte komplett auszufüllen. */}
            <div className="w-full max-w-[min(90vw,90vh)] lg:max-w-[82vh] aspect-square flex-shrink-0">
              <Board diceRoll={lastDiceValue ?? 1} />
            </div>

            <div className="w-full lg:hidden mt-4">
              <DicePanel
                currentRoll={lastDiceValue}
                onRoll={handleRoll}
                disabled={!canRoll}
                phase={phaseConfig[gamePhase].label}
              />
            </div>
          </div>

          {/* RECHTER CONTAINER (Desktop Side Panel):
        Passt sich durch "items-stretch" im Grid automatisch der neuen, größeren Höhe des Boards an! */}
          <div className="hidden lg:flex w-full flex-col h-full min-h-0 gap-4">
            {/* LEADERBOARD PANEL */}
            <div className="flex-1 min-h-0 flex flex-col">
              <LeaderboardPanel />
            </div>

            {/* NOTIFICATION SLOT */}
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

            {/* DICE PANEL */}
            <div className="flex-1 min-h-0 flex flex-col">
              <DicePanel
                currentRoll={lastDiceValue}
                onRoll={handleRoll}
                disabled={!canRoll}
                phase={phaseConfig[gamePhase].label}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
