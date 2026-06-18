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

  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [results, setResults] = useState<GameResults[] | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadGame = async () => {
      try {
        const state = await getSessionState(id);
        setGameState(state);
        if (state.status === "IN_PROGRESS") {
          await reconnectSession(id);
        } else if (state.status === "FINISHED") {
          const res = await getSessionResults(id);
          setResults(res);
        }
      } catch (err) {
        console.error("Failed to load game session", err);
      }
    };
    loadGame();
  }, [id, setGameState]);

  useEffect(() => {
    if (gameState?.status === "FINISHED" && id && !results) {
      getSessionResults(id)
        .then(setResults)
        .catch((err) => console.error("Failed to load results", err));
    }
  }, [gameState?.status, id, results]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
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
        title: data.outcome === "CAPTURED" ? "SCHLAG!" : data.outcome === "GOAL" ? "ZIEL!" : "ZUG",
        message: actionMsg,
        iconType: data.outcome === "CAPTURED" ? "CAPTURE" : data.outcome === "GAME_WON" ? "WIN" : "INFO",
      });
    },

    onTurnChanged: (data) => {
      console.log("Turn changed Event empfangen für Spieler ID:", data.currentPlayerId);
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

  return (
    <div className="h-screen bg-primary flex flex-col overflow-hidden relative">
      <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none lg:hidden">
        <div className="pointer-events-auto max-w-[450px] mx-auto">
          <NotificationPanel
            data={notification}
            onClose={() => setNotification(null)}
          />
        </div>
      </div>

      <PageSubHeader center={`SPIEL #${id || ""}`} />

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

      <div className="w-full max-w-[1440px] mx-auto flex flex-col flex-1 min-h-0 items-center justify-center">
        <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-12 items-center md:justify-center flex-1 min-h-0 mx-auto">
          <div className="flex flex-col justify-center items-center shrink min-w-0 min-h-0 order-2 lg:order-1">
            <div className="w-[80vw] h-[80vw] max-w-[80vh] max-h-[80vh] flex justify-center items-center">
              <Board diceRoll={lastDiceValue ?? 1} />
            </div>
          </div>

          <div className="w-[80vw] max-w-[80vh] lg:w-[350px] lg:max-w-none shrink-0 flex flex-row lg:flex-col gap-4 items-stretch justify-center order-1 lg:order-2">
            <div className="hidden lg:block w-full">
              <NotificationPanel
                data={notification}
                onClose={() => setNotification(null)}
              />
            </div>

            <LeaderboardPanel
              isSquished={!!notification}
              className="flex-1 lg:flex-none"
            />

            <DicePanel
              currentRoll={lastDiceValue}
              onRoll={handleRoll}
              disabled={!canRoll}
              className="flex-1 lg:flex-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
