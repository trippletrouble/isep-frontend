import { useParams } from "react-router-dom";
import { ScrollText } from "lucide-react";
import { CreateLobbyCard } from "./CreateLobbyCard";
import { JoinLobbyCard } from "./JoinLobbyCard";
import { PageSubHeader } from "@/components/layout/PageSubHeader";

export function LobbyPage() {
  const { level } = useParams<{ level: string }>();

  return (
    <div>
      <PageSubHeader
        backTo="/"
        center={`LEVEL ${level}`}
        right={
          <button className="flex items-center gap-2 text-[24px] font-bold hover:text-white transition-colors">
            Regeln <ScrollText size={20} />
            {/* Week 2: open RulesDialog */}
          </button>
        }
      />

      <h1 className="font-lilita text-white text-4xl md:text-6xl uppercase leading-none mb-8">
        LEVEL {level}
      </h1>

      <div className="flex gap-6">
        <CreateLobbyCard />
        <JoinLobbyCard />
      </div>
    </div>
  );
}
