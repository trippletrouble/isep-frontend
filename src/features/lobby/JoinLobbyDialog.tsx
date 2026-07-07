import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLobby } from "@/hooks/useLobby";
import { useAuth } from "@/hooks";
import { useUIStore } from "@/stores/ui.store";

interface JoinLobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinLobbyDialog({ open, onOpenChange }: JoinLobbyDialogProps) {
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
      onOpenChange(false);
      navigate(`/lobby/${resolvedSessionId}`);
    } catch (err) {
      console.error("Failed to join lobby", err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-primary border border-accent text-white rounded-4xl p-6 md:p-12 max-w-md shadow-2xl w-[calc(100%-2rem)] backdrop-blur-xl outline-none ring-0 focus-visible:ring-0"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 text-red hover:opacity-80 transition-opacity bg-transparent border-none outline-none z-10"
          aria-label="Lobby beitreten schließen"
        >
          <X className="w-7 h-7 md:w-9 md:h-9 stroke-[2.5]" />
        </button>

        <DialogHeader className="p-0 text-left">
          <DialogTitle className="font-bold text-white text-3xl md:text-5xl uppercase tracking-[2%] font-lilita m-0 pt-2">
            Lobby beitreten
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 md:gap-6 mt-6 w-full">
          <Input
            type="text"
            required
            placeholder="Dein Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="bg-primary border-accent text-white placeholder:text-accent text-base placeholder:text-base h-12 rounded-xl focus:ring-0 focus-visible:ring-0"
          />

          <Input
            type="text"
            placeholder="Lobby-Code"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value)}
            className="bg-primary border-accent text-white placeholder:text-accent text-base placeholder:text-base h-12 rounded-xl focus:ring-0 focus-visible:ring-0"
          />

          <Button
            onClick={handleJoin}
            disabled={!lobbyCode.trim() || !playerName.trim()}
            className="w-full font-lilita text-xl tracking-wider bg-green text-primary hover:bg-[#47cb7f] h-14 rounded-[20px] uppercase disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            Beitreten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
