interface LeaderboardPanelProps {
  isSquished?: boolean;
}

export const LeaderboardPanel = ({ isSquished }: LeaderboardPanelProps) => {
  const players = [
    { name: "Spieler 2", color: "bg-yellow", score: 3 },
    { name: "Spieler 1", color: "bg-red", score: 2 },
    { name: "Spieler 3", color: "bg-blue", score: 1 },
    { name: "Spieler 4", color: "bg-green", score: 0 },
  ];

  return (
    <div
      className={`border border-accent hover:border-white rounded-4xl flex flex-col justify-around w-full overflow-hidden transition-all shrink-0 mb-4 ${
        isSquished
          ? "max-h-[84px] p-6 duration-[800ms] ease-[cubic-bezier(0.4,1.8,0.5,1)]"
          : "max-h-[1000px] flex-1 min-h-0 p-8 duration-[500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      }`}
    >
      <h2
        className={`text-3xl text-white font-lilita uppercase tracking-[0.02em] text-center drop-shadow-md transition-all ${
          isSquished ? "mb-0 duration-[800ms]" : "mb-6 duration-[500ms]"
        }`}
      >
        Leaderboard
      </h2>

      <div
        className={`flex flex-col gap-4 font-afacad text-xl text-white transition-all ${
          isSquished
            ? "opacity-0 translate-y-8 duration-[400ms]"
            : "opacity-100 translate-y-0 duration-[500ms] delay-100"
        }`}
      >
        {players.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center px-2 shrink-0"
          >
            <span className="font-semibold text-2xl tracking-wide">
              {p.name}
            </span>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, dotIdx) => {
                const isFilled = dotIdx < p.score;
                return (
                  <div
                    key={dotIdx}
                    className={`w-6 h-6 border-2 border-primary rounded-full ${
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
  );
};
