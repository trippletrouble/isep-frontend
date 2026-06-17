import { useGameStore } from "@/stores/game.store";

interface LeaderboardPanelProps {
  isSquished?: boolean;
  className?: string;
}

export const LeaderboardPanel = ({
  isSquished,
  className = "",
}: LeaderboardPanelProps) => {
  const storePlayers = useGameStore((state) => state.players);

  const colorClassMap: Record<string, string> = {
    RED: "bg-red",
    BLUE: "bg-blue",
    GREEN: "bg-green",
    YELLOW: "bg-yellow",
  };

  const players =
    storePlayers && storePlayers.length > 0
      ? storePlayers.map((p) => ({
          name: p.username,
          color: colorClassMap[p.color] || "bg-red",
          score: p.figuresInGoal,
        }))
      : [
          { name: "Spieler 2", color: "bg-yellow", score: 3 },
          { name: "Spieler 1", color: "bg-red", score: 2 },
          { name: "Spieler 3", color: "bg-blue", score: 1 },
          { name: "Spieler 4", color: "bg-green", score: 0 },
        ];

  return (
    <div
      className={`border border-accent hover:border-white rounded-2xl lg:rounded-4xl flex flex-col w-full min-h-0 min-w-0 transition-all overflow-hidden ${className} ${
        isSquished
          ? "h-full lg:h-auto lg:max-h-[84px] lg:shrink-0 p-4 lg:p-6 duration-[800ms] ease-[cubic-bezier(0.4,1.8,0.5,1)]"
          : "max-h-[1000px] h-full lg:h-auto p-4 lg:p-8 duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      }`}
    >
      <h2
        className={`text-lg lg:text-3xl text-white font-lilita uppercase tracking-[0.02em] text-center drop-shadow-md shrink-0 transition-all ${
          isSquished
            ? "mb-3 lg:mb-0 duration-[800ms]"
            : "mb-3 lg:mb-6 duration-[500ms]"
        }`}
      >
        Leaderboard
      </h2>

      <div
        className={`flex flex-col font-afacad text-base lg:text-xl text-white transition-all overflow-y-auto custom-scrollbar flex-1 justify-center ${
          isSquished
            ? "opacity-100 lg:opacity-0 translate-y-0 lg:translate-y-8 duration-[400ms]"
            : "opacity-100 translate-y-0 duration-[500ms] delay-100"
        }`}
      >
        <div className="w-full flex flex-col justify-center gap-2 lg:gap-4">
          {players.map((p, i) => (
            <div key={i} className="flex justify-between items-center shrink-0">
              <span className="font-semibold text-sm lg:text-2xl tracking-wide whitespace-nowrap">
                {p.name}
              </span>
              <div className="flex gap-1 lg:gap-2">
                {Array.from({ length: 4 }).map((_, dotIdx) => {
                  const isFilled = dotIdx < p.score;
                  return (
                    <div
                      key={dotIdx}
                      className={`w-3 h-3 lg:w-6 lg:h-6 border-2 border-primary rounded-full ${
                        isFilled
                          ? `${p.color} shadow-[0px_6px_22.2px_rgba(255,255,255,0.05)]`
                          : "bg-transparent"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
