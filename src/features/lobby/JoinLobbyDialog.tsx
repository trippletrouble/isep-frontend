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
import { useTranslation } from "@/i18n";

interface JoinLobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinLobbyDialog({ open, onOpenChange }: JoinLobbyDialogProps) {
  const navigate = useNavigate();
  const { joinLobby } = useLobby();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [playerName, setPlayerName] = useState(user?.username || "");
  const [lobbyCode, setLobbyCode] = useState("");

  async function handleJoin() {
    try {
      await joinLobby(lobbyCode, {});
      onOpenChange(false);
      navigate(`/lobby/${lobbyCode}`);
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
            {t("Lobby beitreten")}
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
            {t("Beitreten")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
