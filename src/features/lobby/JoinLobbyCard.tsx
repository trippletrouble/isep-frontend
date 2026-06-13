import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinLobbyCard() {
  const [lobbyCode, setLobbyCode] = useState("");

  function handleJoin() {
    // Week 2: POST /sessions/:id/join with lobby code
  }

  return (
    <div className="flex-1 rounded-[40px] border border-accent bg-primary p-8 shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex flex-col gap-6">
      <span className="font-bold text-white text-[40px] uppercase tracking-[2%]">
        Lobby beitreten
      </span>
      <div className="flex flex-col gap-4 flex-1">
        <Input
          type="text"
          placeholder="Lobby-Code"
          value={lobbyCode}
          onChange={(e) => setLobbyCode(e.target.value)}
          className="bg-primary border-accent text-white placeholder:text-accent h-12 rounded-xl"
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
