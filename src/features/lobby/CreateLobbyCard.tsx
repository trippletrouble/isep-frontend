import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLobby } from "@/hooks/useLobby";
import type { AdditionalRule } from "@/api/types";

export function CreateLobbyCard() {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { createLobby } = useLobby();

  const [playerName, setPlayerName] = useState("");
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [againstAI, setAgainstAI] = useState(false);
  const [gameMode, setGameMode] = useState<"klassisch" | "erweitert">(
    "klassisch",
  );

  async function handleCreate() {
    const rules: AdditionalRule[] = [];
    if (level === "1") {
      rules.push("THROW_AGAIN_ON_6");
    } else if (level === "2") {
      rules.push("THREE_SIXES_LOSE_TURN");
    } else if (level === "3") {
      rules.push("THROW_AGAIN_ON_6", "THREE_SIXES_LOSE_TURN");
    }

    try {
      const lobby = await createLobby({
        numberOfPlayers: playerCount,
        mode: "CLASSIC",
        boardTheme: "CLASSIC",
        isPrivate: false,
        additionalRules: rules,
      });
      navigate(`/lobby/${lobby.sessionId}`);
    } catch (err) {
      console.error("Failed to create lobby", err);
    }
  }

  return (
    <div className="flex-1 rounded-[40px] border border-accent bg-primary p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex flex-col gap-6">
      <span className="font-bold text-white text-[40px] uppercase tracking-[2%]">
        Lobby erstellen
      </span>
      <div className="flex flex-col gap-4 flex-1">
        <Input
          type="text"
          placeholder="Dein Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="bg-primary border-accent text-white placeholder:text-accent h-12 rounded-xl"
        />
        <select
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
          className="bg-primary border border-accent text-white h-12 rounded-xl px-4 w-full"
        >
          <option value={2}>2 Spieler</option>
          <option value={3}>3 Spieler</option>
          <option value={4}>4 Spieler</option>
        </select>
        <select
          value={gameMode}
          onChange={(e) =>
            setGameMode(e.target.value as "klassisch" | "erweitert")
          }
          className="bg-primary border border-accent text-white h-12 rounded-xl px-4 w-full"
        >
          <option value="klassisch">Klassisch</option>
          <option value="erweitert">Erweitert</option>
        </select>
        <label className="flex items-center gap-3 text-white font-bold text-[18px] cursor-pointer">
          <input
            type="checkbox"
            checked={againstAI}
            onChange={(e) => setAgainstAI(e.target.checked)}
            className="w-5 h-5 accent-green"
          />
          Gegen KI
        </label>
      </div>
      <Button
        onClick={handleCreate}
        className="w-full font-lilita text-xl tracking-wider bg-green text-primary hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
      >
        Erstellen
      </Button>
    </div>
  );
}
