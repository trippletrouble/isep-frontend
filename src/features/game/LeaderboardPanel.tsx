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
    YELLOW:
      "shadow-[0_0_15px_rgba(235,224,54,0.4)] bg-yellow/10 border-yellow/30",
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
          {
            name: "jan",
            color: "bg-red",
            score: 0,
            isCurrentTurn: true,
            rawColor: "RED",
          },
          {
            name: "sarah",
            color: "bg-blue",
            score: 0,
            isCurrentTurn: false,
            rawColor: "BLUE",
          },
        ];

  return (
    <div
      className={`bg-[#282828] border border-white/10 shadow-2xl rounded-3xl flex flex-col w-full p-6 transition-all duration-500 hover:border-white/20 ${className}`}
    >
      <h2 className="text-[18px] md:text-[22px] text-white font-lilita uppercase tracking-[0.04em] text-center drop-shadow-md mb-4 md:mb-6">
        Leaderboard
      </h2>

      <div className="flex flex-col font-afacad text-white w-full gap-2 md:gap-3">
        {players.map((p, i) => (
          <div
            key={i}
            className={`flex justify-between items-center p-2 px-3.5 rounded-xl border border-transparent transition-all duration-300 ${
              p.isCurrentTurn
                ? `${activeShadowMap[p.rawColor]} scale-[1.02]`
                : "opacity-60"
            }`}
          >
            {/* Name + Ping */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {p.isCurrentTurn && (
                <span className="relative flex h-3 w-3 shrink-0">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${p.color}`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${p.color}`}
                  />
                </span>
              )}
              <span
                className={`font-semibold text-sm md:text-lg tracking-wide truncate ${
                  p.isCurrentTurn ? "text-white font-bold" : "text-white/80"
                }`}
              >
                {p.name}
              </span>
            </div>

            {/* Score dots */}
            <div className="flex gap-1.5 shrink-0">
              {Array.from({ length: 4 }).map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  className={`w-3.5 h-3.5 md:w-5 md:h-5 border-2 border-primary rounded-full transition-all duration-300 ${
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
