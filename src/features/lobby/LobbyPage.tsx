import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScrollText, Copy, LogOut, Play, User } from "lucide-react";
import { RulesDialog } from "@/features/level-select/RulesDialog";
import { CreateLobbyCard } from "./CreateLobbyCard";
import { JoinLobbyCard } from "./JoinLobbyCard";
import { PageSubHeader } from "@/components/layout/PageSubHeader";
import { useLobby } from "@/hooks/useLobby";
import { useAuthStore } from "@/stores/auth.store";
import { useSSE } from "@/hooks/useSSE";
import { toast } from "sonner";
import { ApiError } from "@/api/client";

export function LobbyPage() {
  const { level, sessionId } = useParams<{
    level?: string;
    sessionId?: string;
  }>();
  const navigate = useNavigate();

  const {
    currentLobby,
    players,
    isLoading,
    fetchLobby,
    leaveLobby,
    startGame,
    generateInvite,
  } = useLobby();

  const user = useAuthStore((state) => state.user);
  const [inviteInfo, setInviteInfo] = useState<{
    inviteToken: ***ENTFERNT***
    inviteUrl: string;
  } | null>(null);

  const [rulesOpen, setRulesOpen] = useState(false);


  const resolvedParam = level || sessionId || "";
  const isSessionId =
    resolvedParam !== "" && !resolvedParam.startsWith("level-");

  const cleanLevel = resolvedParam.replace("level-", "").trim() || "0";
  const levelId = isSessionId ? 0 : Number(cleanLevel);

  const activeSessionId = sessionId || level || "";

  useEffect(() => {
    if (!isSessionId || !activeSessionId) return;
    fetchLobby(activeSessionId);
    const interval = setInterval(async () => {
      try {
        await fetchLobby(activeSessionId);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          navigate(`/game/${activeSessionId}`);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionId, activeSessionId, fetchLobby, navigate]);

  useEffect(() => {
    if (currentLobby?.status === "IN_PROGRESS") {
      navigate(`/game/${currentLobby.sessionId}`);
    }
  }, [currentLobby, navigate]);

  useSSE(isSessionId && activeSessionId ? activeSessionId : null, {
    onGameState: (state) => {
      if (state.status === "IN_PROGRESS") navigate(`/game/${activeSessionId}`);
    },
    onGameStarted: () => {
      navigate(`/game/${activeSessionId}`);
    },
  });

  async function handleLeave() {
    if (activeSessionId) {
      try {
        await leaveLobby(activeSessionId);
        navigate("/");
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleStart() {
    if (activeSessionId) {
      try {
        await startGame(activeSessionId);
        navigate(`/game/${activeSessionId}`);
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleGenerateInvite() {
    if (activeSessionId) {
      try {
        const result = await generateInvite(activeSessionId);
        setInviteInfo(result);
        await navigator.clipboard.writeText(result.inviteUrl);
        toast.success("Einladungslink in die Zwischenablage kopiert!");
      } catch (err) {
        console.error(err);
      }
    }
  }

  if (isSessionId) {
    if (isLoading && !currentLobby) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-primary text-white font-lilita text-2xl uppercase tracking-widest">
          Lobby laden...
        </div>
      );
    }

    if (!currentLobby) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-primary text-white font-lilita text-2xl uppercase tracking-widest gap-4">
          Lobby nicht gefunden.
          <button
            onClick={() => navigate("/")}
            className="text-sm underline font-afacad"
          >
            Zurück zur Übersicht
          </button>
        </div>
      );
    }

    const isHost = currentLobby.hostId === user?.id;

    return (
      <>
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          <PageSubHeader
            backTo="/"
            center={`LOBBY`}
            right={
              <button
                onClick={() => setRulesOpen(true)}
                className="flex items-center gap-2 text-[24px] font-bold hover:text-white transition-colors"
              >
                Regeln <ScrollText size={20} />
              </button>
            }
          />

          <div className="bg-primary border border-accent rounded-[40px] p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex flex-col gap-8">
            <div className="flex justify-between items-start border-b border-accent pb-6">
              <div>
                <h1 className="font-lilita text-white text-3xl md:text-5xl uppercase tracking-wider leading-none mb-2">
                  Spiel-Lobby
                </h1>
                <p className="text-accent text-sm md:text-base font-bold">
                  ID:{" "}
                  <span className="text-white select-all">
                    {currentLobby.sessionId}
                  </span>
                </p>
              </div>
              {isHost && (
                <button
                  onClick={handleGenerateInvite}
                  className="flex items-center gap-2 bg-yellow hover:opacity-90 text-primary font-bold px-4 py-2 rounded-xl transition-all font-afacad"
                >
                  <Copy size={18} />
                  Einladen
                </button>
              )}
            </div>

            {inviteInfo && (
              <div className="bg-[#383838] border border-accent rounded-xl p-4 flex flex-col gap-2">
                <span className="text-white font-bold text-sm">
                  Lobby-Code:
                </span>
                <span className="text-yellow text-xl font-mono font-bold tracking-widest select-all">
                  {inviteInfo.inviteToken}
                </span>
                <span className="text-white font-bold text-sm mt-2">
                  Einladungslink:
                </span>
                <span className="text-accent text-xs break-all select-all">
                  {inviteInfo.inviteUrl}
                </span>
              </div>
            )}

            <div>
              <h2 className="font-lilita text-white text-xl uppercase tracking-wider mb-4">
                Spieler in der Lobby ({players.length}/
                {currentLobby.settings.numberOfPlayers})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({
                  length: currentLobby.settings.numberOfPlayers,
                }).map((_, idx) => {
                  const player = players[idx];
                  const colorMap: Record<string, string> = {
                    RED: "bg-[#DB5757]",
                    BLUE: "bg-[#577CDB]",
                    YELLOW: "bg-[#EBE036]",
                    GREEN: "bg-[#57DB8F]",
                  };

                  return (
                    <div
                      key={idx}
                      className="bg-[#292929] border border-accent rounded-[20px] p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                            player ? colorMap[player.color] : "bg-[#5B5B5B]"
                          }`}
                        >
                          <User size={20} />
                        </div>
                        <div>
                          <span className="text-white font-bold block">
                            {player ? player.username : "Warte auf Spieler..."}
                          </span>
                          {player && (
                            <span className="text-accent text-xs">
                              {player.id === currentLobby.hostId
                                ? "Lobby-Host"
                                : "Spieler"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-accent">
              <button
                onClick={handleLeave}
                className="flex-1 h-[60px] bg-[#3A3A3A] border border-accent text-white hover:bg-[#4A4A4A] font-bold text-xl rounded-[20px] flex items-center justify-center gap-2 transition-all"
              >
                <LogOut size={20} />
                Lobby verlassen
              </button>

              {isHost && (
                <div className="flex-1 flex flex-col gap-2">
                  <button
                    onClick={handleStart}
                    disabled={players.length < 2}
                    className="w-full h-[60px] bg-green text-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-lilita text-2xl uppercase rounded-[20px] flex items-center justify-center gap-2 transition-all"
                  >
                    <Play size={22} fill="currentColor" />
                    Spiel starten
                  </button>
                  {players.length < 2 && (
                    <button
                      onClick={() => navigate("/game/sandbox")}
                      className="w-full h-[40px] bg-yellow/80 hover:bg-yellow text-primary font-bold rounded-[15px] flex items-center justify-center gap-1.5 transition-all text-sm font-afacad"
                    >
                      <Play size={16} fill="currentColor" />
                      Offline-Sandbox-Test starten
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <RulesDialog
          levelId={levelId}
          open={rulesOpen}
          onOpenChange={setRulesOpen}
        />
      </>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
      <PageSubHeader
        backTo="/"
        center={`LEVEL ${cleanLevel}`}
        right={
          <button
            onClick={() => setRulesOpen(true)}
            className="flex items-center gap-2 text-[24px] font-bold hover:text-white transition-colors"
          >
            Regeln <ScrollText size={20} />
          </button>
        }
      />

      <h1 className="font-lilita text-white text-4xl md:text-6xl uppercase leading-none mb-8">
        LEVEL {cleanLevel}
      </h1>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        <CreateLobbyCard cleanLevel={cleanLevel} />
        <JoinLobbyCard />
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate("/game/sandbox")}
          className="px-6 py-3 bg-yellow hover:opacity-90 text-primary font-bold rounded-xl transition-all font-afacad text-lg shadow-lg flex items-center gap-2"
        >
          <Play size={20} fill="currentColor" />
          Offline-Sandbox testen (Ohne Mitspieler)
        </button>
      </div>
      <RulesDialog
        levelId={levelId}
        open={rulesOpen}
        onOpenChange={setRulesOpen}
      />
    </div>
  );
}
