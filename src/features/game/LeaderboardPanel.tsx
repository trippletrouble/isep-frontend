import { useGameStore } from "@/stores/game.store";

interface LeaderboardPanelProps {
  // isSquished?: boolean;
  className?: string;
}

export const LeaderboardPanel = ({
  // isSquished,
  className = "",
}: LeaderboardPanelProps) => {
  const storePlayers = useGameStore((state) => state.players);

  const colorClassMap: Record<string, string> = {
    RED: "bg-red",
    BLUE: "bg-blue",
    GREEN: "bg-green",
    YELLOW: "bg-yellow",
  };

  const activeShadowMap: Record<string, string> = {
    RED: "shadow-[0_0_15px_rgba(219,87,87,0.4)] bg-red/10 border-red/30",
    BLUE: "shadow-[0_0_15px_rgba(87,124,219,0.4)] bg-blue/10 border-blue/30",
    GREEN: "shadow-[0_0_15px_rgba(87,219,143,0.4)] bg-green/10 border-green/30",
    YELLOW: "shadow-[0_0_15px_rgba(235,224,54,0.4)] bg-yellow/10 border-yellow/30",
  };

  const players =
    storePlayers && storePlayers.length > 0
      ? storePlayers.map((p) => ({
          name: p.username,
          color: colorClassMap[p.color] || "bg-red",
          score: p.figuresInGoal,
          isCurrentTurn: p.isCurrentTurn,
          rawColor: p.color,
        }))
      : [
          { name: "jan", color: "bg-red", score: 0, isCurrentTurn: true, rawColor: "RED" },
          { name: "sarah", color: "bg-blue", score: 0, isCurrentTurn: false, rawColor: "BLUE" },
        ];

  return (
    <div
      className={`border border-accent hover:border-white rounded-2xl lg:rounded-4xl flex flex-col w-full transition-all duration-500 p-3 lg:p-8 ${className}`}
    >
      <h2 className="text-sm lg:text-3xl text-white font-lilita uppercase tracking-[0.02em] text-center drop-shadow-md mb-2 lg:mb-6">
        Leaderboard
      </h2>

      <div className="flex flex-col font-afacad text-white w-full gap-1 lg:gap-3">
        {players.map((p, i) => (
          <div
            key={i}
            className={`flex justify-between items-center px-2 py-1 lg:p-2 lg:px-3 rounded-xl border border-transparent transition-all duration-300 ${
              p.isCurrentTurn
                ? `${activeShadowMap[p.rawColor]} scale-[1.02]`
                : "opacity-60"
            }`}
          >
            {/* Name + Ping */}
            <div className="flex items-center gap-1.5 lg:gap-3 min-w-0">
              {p.isCurrentTurn && (
                <span className="relative flex h-2 w-2 lg:h-3.5 lg:w-3.5 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${p.color}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 lg:h-3.5 lg:w-3.5 ${p.color}`} />
                </span>
              )}
              <span
                className={`font-semibold text-xs lg:text-2xl tracking-wide truncate ${
                  p.isCurrentTurn ? "text-white font-bold" : "text-white/80"
                }`}
              >
                {p.name}
              </span>
            </div>

            {/* Score dots */}
            <div className="flex gap-1 lg:gap-2 shrink-0">
              {Array.from({ length: 4 }).map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  className={`w-2 h-2 lg:w-6 lg:h-6 border-2 border-primary rounded-full transition-all duration-300 ${
                    dotIdx < p.score
                      ? `${p.color} shadow-[0px_6px_22.2px_rgba(255,255,255,0.05)]`
                      : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};