import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLobby } from "@/hooks/useLobby";
import { useAuth } from "@/hooks";
import { useUIStore } from "@/stores/ui.store";

export function JoinLobbyCard() {
  const navigate = useNavigate();
  const { joinLobby } = useLobby();
  const { user } = useAuth();

  const [playerName, setPlayerName] = useState(user?.username || "");
  const [lobbyCode, setLobbyCode] = useState("");

  async function handleJoin() {
    const trimmedCode = lobbyCode.trim();
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = trimmedCode.match(uuidRegex);
    const resolvedSessionId = match ? match[0] : trimmedCode;

    if (!resolvedSessionId) {
      useUIStore.getState().addToast({
        type: "error",
        title: "Fehler",
        message: "Bitte gib einen gültigen Lobby-Code oder Einladungslink ein!"
      });
      return;
    }

    const tokenMatch = trimmedCode.match(/[?&](token|inviteToken)=([^&]+)/);
    const inviteToken = tokenMatch ? decodeURIComponent(tokenMatch[2]) : undefined;

    try {
      await joinLobby(resolvedSessionId, { inviteToken });
      navigate(`/lobby/${resolvedSessionId}`);
    } catch (err) {
      console.error("Failed to join lobby", err);
    }
  }

  return (
    <div className="flex-1 rounded-[40px] border border-accent bg-primary p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex flex-col gap-6">
      <span className="font-bold text-white text-[40px] uppercase tracking-[2%]">
        Lobby beitreten
      </span>
      <div className="flex flex-col gap-4 flex-1">
        <Input
          type="text"
          required
          placeholder="Dein Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="bg-primary border-accent text-white placeholder:text-accent text-base placeholder:text-base h-12 rounded-xl"
        />

        <Input
          type="text"
          placeholder="Lobby-Code"
          value={lobbyCode}
          onChange={(e) => setLobbyCode(e.target.value)}
          className="bg-primary border-accent text-white placeholder:text-accent text-base placeholder:text-base h-12 rounded-xl"
        />
      </div>
      <Button
        onClick={handleJoin}
        className="w-full font-lilita text-xl tracking-wider bg-green text-primary hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase"
      >
        Beitreten
      </Button>
    </div>
  );
}
