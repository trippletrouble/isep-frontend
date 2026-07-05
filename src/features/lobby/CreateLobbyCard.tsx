import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks";
import { toast } from "sonner";

interface CreateLobbyCardProps {
  cleanLevel: string;
}

export function CreateLobbyCard({ cleanLevel }: CreateLobbyCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { createLobby } = useLobby();
  const { user } = useAuth();

  const [playerName, setPlayerName] = useState(user?.username || "");
  const [playerCount, setPlayerCount] = useState<string>("4");
  const [againstAI, setAgainstAI] = useState(false);

  const getInitialRules = (): string[] => {
    const routeState = location.state as { rules?: string[] } | null;
    if (routeState && Array.isArray(routeState.rules)) {
      return routeState.rules;
    }

    if (cleanLevel === "0") return ["THROW_AGAIN_ON_6"];
    if (cleanLevel === "1") return ["THROW_AGAIN_ON_6", "QUIZ_DUELL"];
    if (cleanLevel === "2" || cleanLevel === "3") {
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
    if (!playerName.trim()) return;

    if (cleanLevel === "1" && !quizDuell) {
      toast.error("Für Level 1 muss mindestens ein Modifikator aktiv sein!");
      return;
    }

    const rules: AdditionalRule[] = [];
    if (throwAgainOn6) rules.push("THROW_AGAIN_ON_6");
    if (quizDuell && cleanLevel !== "0") rules.push("QUIZ_DUELL");
    if (threeSixesLoseTurn) rules.push("THREE_SIXES_LOSE_TURN");

    try {
      const lobby = await createLobby({
        numberOfPlayers: Number(playerCount),
        mode: "CLASSIC",
        boardTheme: "CLASSIC",
        isPrivate: false,
        additionalRules: rules,
      });

      navigate(`/lobby/${lobby.sessionId}`, {
        state: { nickname: playerName.trim() },
      });
    } catch (err) {
      console.error("Failed to create lobby", err);
    }
  }

  const showModifiers = cleanLevel !== "0";

  return (
    <div className="flex-1 rounded-[40px] border border-accent bg-primary p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex flex-col gap-6">
      <span className="font-bold text-white text-[40px] uppercase tracking-[2%]">
        Lobby erstellen
      </span>

      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            required
            placeholder="Dein Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="bg-primary border-accent text-white placeholder:text-accent h-12 rounded-xl"
          />

          <Select value={playerCount} onValueChange={setPlayerCount}>
            <SelectTrigger className="bg-primary border border-accent text-white text-base h-12 rounded-xl px-4 w-full focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Spieler auswählen" />
            </SelectTrigger>
            <SelectContent className="bg-primary border border-accent text-white text-base rounded-xl">
              <SelectItem value="2">2 Spieler</SelectItem>
              <SelectItem value="3">3 Spieler</SelectItem>
              <SelectItem value="4">4 Spieler</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-3 text-white font-bold text-[18px] cursor-pointer w-max">
          <input
            type="checkbox"
            checked={againstAI}
            onChange={(e) => setAgainstAI(e.target.checked)}
            className="w-5 h-5 accent-green rounded border-accent bg-primary"
          />
          Gegen KI
        </label>

        <div className="border-t border-accent/40 pt-5 flex flex-col gap-3">
          <span className="text-white/60 font-extrabold uppercase text-xs tracking-widest">
            Zusätzliche Regeln
          </span>

          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between bg-primary-dark/30 p-4 rounded-2xl border-2 border-accent/20 hover:border-accent/40 transition-all min-h-[4.5rem] w-full">
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl text-blue flex items-center justify-center border-2 border-blue">
                  <Dices size={22} />
                </div>
                <span className="text-white text-lg font-bold tracking-wide">
                  Nochmal würfeln bei 6
                </span>
              </div>
              <Switch
                checked={throwAgainOn6}
                onCheckedChange={setThrowAgainOn6}
              />
            </div>

            <div className="flex items-center justify-between bg-primary-dark/30 p-4 rounded-2xl border-2 border-accent/20 hover:border-accent/40 transition-all min-h-[4.5rem] w-full">
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl text-red flex items-center justify-center border-2 border-red">
                  <Flame size={22} />
                </div>
                <span className="text-white text-lg font-bold tracking-wide">
                  3 Sechsen = Rundenverlust
                </span>
              </div>
              <Switch
                checked={threeSixesLoseTurn}
                onCheckedChange={setThreeSixesLoseTurn}
              />
            </div>
          </div>
        </div>

        {showModifiers && (
          <div className="border-t border-accent/40 pt-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-yellow font-extrabold uppercase text-xs tracking-widest">
                Modifikatoren
              </span>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <div className="relative overflow-hidden flex items-center justify-between border-2 border-yellow/20 hover:border-yellow/80 p-5 rounded-2xl transition-colors min-h-20 w-full group">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl text-yellow flex items-center justify-center border border-yellow/20 group-hover:border-yellow/80 shadow-inner transition-transform duration-300 ease-out group-hover:scale-110">
                    <Swords size={24} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xl font-black tracking-wide">
                        Quiz-Duell Modus
                      </span>
                    </div>
                    <span className="text-white/50 text-sm font-medium mt-0.5">
                      Ein Wissensduell bricht aus, wenn du eine gegnerische
                      Spielfigur schlagen willst!
                    </span>
                  </div>
                </div>

                <div className="pl-4">
                  <Switch checked={quizDuell} onCheckedChange={setQuizDuell} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleCreate}
        disabled={!playerName.trim()}
        className="w-full font-lilita text-2xl tracking-wider bg-green text-primary hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Erstellen
      </Button>
    </div>
  );
}
