import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLobby } from "@/hooks/useLobby";
import type { AdditionalRule } from "@/api/types";
import { Dices, Swords, Flame } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks";

export function CreateLobbyCard() {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { createLobby } = useLobby();
  const { user } = useAuth();

  const [playerName, setPlayerName] = useState(user?.username || "");
  const [playerCount, setPlayerCount] = useState<string>("4");
  const [againstAI, setAgainstAI] = useState(false);
  const [gameMode, setGameMode] = useState<"klassisch" | "erweitert">(
    "klassisch",
  );

  const getInitialRules = (): string[] => {
    const routeState = location.state as { rules?: string[] } | null;
    if (routeState && Array.isArray(routeState.rules)) {
      return routeState.rules;
    }
    if (level === "0") return ["THROW_AGAIN_ON_6"];
    if (level === "1") return ["THROW_AGAIN_ON_6", "QUIZ_DUELL"];
    if (level === "2" || level === "3") {
      return ["THROW_AGAIN_ON_6", "QUIZ_DUELL", "THREE_SIXES_LOSE_TURN"];
    }
    return [];
  };

  const [throwAgainOn6, setThrowAgainOn6] = useState(() =>
    getInitialRules().includes("THROW_AGAIN_ON_6"),
  );
  const [quizDuell, setQuizDuell] = useState(() =>
    getInitialRules().includes("QUIZ_DUELL"),
  );
  const [threeSixesLoseTurn, setThreeSixesLoseTurn] = useState(() =>
    getInitialRules().includes("THREE_SIXES_LOSE_TURN"),
  );

  async function handleCreate() {
    const rules: AdditionalRule[] = [];
    if (throwAgainOn6) rules.push("THROW_AGAIN_ON_6");
    if (quizDuell) rules.push("QUIZ_DUELL");
    if (threeSixesLoseTurn) rules.push("THREE_SIXES_LOSE_TURN");

    try {
      const lobby = await createLobby({
        numberOfPlayers: Number(playerCount),
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
          required
          placeholder="Dein Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="bg-primary border-accent text-white placeholder:text-accent placeholder:text-base h-12 rounded-xl"
        />

        <Select value={playerCount} onValueChange={setPlayerCount}>
          <SelectTrigger className="bg-primary border border-accent text-white h-12 rounded-xl px-4 w-full focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Spieler auswählen" />
          </SelectTrigger>
          <SelectContent className="bg-primary border border-accent text-white rounded-xl">
            <SelectItem value="2">2 Spieler</SelectItem>
            <SelectItem value="3">3 Spieler</SelectItem>
            <SelectItem value="4">4 Spieler</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={gameMode}
          onValueChange={(value) =>
            setGameMode(value as "klassisch" | "erweitert")
          }
        >
          <SelectTrigger className="bg-primary border border-accent text-white h-12 rounded-xl px-4 w-full focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Modus auswählen" />
          </SelectTrigger>
          <SelectContent className="bg-primary border border-accent text-white hover:text-primary rounded-xl">
            <SelectItem value="klassisch">Klassisch</SelectItem>
            <SelectItem value="erweitert">Erweitert</SelectItem>
          </SelectContent>
        </Select>

        <label className="flex items-center gap-3 text-white font-bold text-[18px] cursor-pointer">
          <input
            type="checkbox"
            checked={againstAI}
            onChange={(e) => setAgainstAI(e.target.checked)}
            className="w-5 h-5 accent-green"
          />
          Gegen KI
        </label>

        <div className="border-t border-accent/40 pt-4 mt-2 flex flex-col gap-1">
          <span className="text-white/60 font-bold uppercase text-base tracking-wider">
            Zusätzliche Regeln anpassen
          </span>

          <div className="flex items-center justify-between bg-primary-dark/20 p-4 rounded-xl hover:bg-accent/5 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#577CDB]/10 text-[#577CDB] flex items-center justify-center border border-[#577CDB]/20">
                <Dices size={18} />
              </div>
              <span className="text-white text-[16px] font-medium">
                Nochmal würfeln bei 6
              </span>
            </div>
            <button
              type="button"
              onClick={() => setThrowAgainOn6(!throwAgainOn6)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                throwAgainOn6 ? "bg-green" : "bg-[#DB5757]"
              }`}
            >
              <div
                className={`bg-primary w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  throwAgainOn6 ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between bg-primary-dark/20 p-4 rounded-xl hover:bg-accent/5 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow/10 text-yellow flex items-center justify-center border border-yellow/20">
                <Swords size={18} />
              </div>
              <span className="text-white text-[16px] font-medium">
                Quiz-Duell Modus
              </span>
            </div>
            <button
              type="button"
              onClick={() => setQuizDuell(!quizDuell)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                quizDuell ? "bg-green" : "bg-[#DB5757]"
              }`}
            >
              <div
                className={`bg-primary w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  quizDuell ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between bg-primary-dark/20 p-4 rounded-xl hover:bg-accent/5 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#DB5757]/10 text-[#DB5757] flex items-center justify-center border border-[#DB5757]/20">
                <Flame size={18} />
              </div>
              <span className="text-white text-[16px] font-medium">
                3 Sechsen = Rundenverlust
              </span>
            </div>
            <button
              type="button"
              onClick={() => setThreeSixesLoseTurn(!threeSixesLoseTurn)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                threeSixesLoseTurn ? "bg-green" : "bg-[#DB5757]"
              }`}
            >
              <div
                className={`bg-primary w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  threeSixesLoseTurn ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      <Button
        onClick={handleCreate}
        className="w-full font-lilita text-xl tracking-wider bg-green text-primary hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase mt-2"
      >
        Erstellen
      </Button>
    </div>
  );
}
