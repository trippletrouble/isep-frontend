import { useState } from "react";
import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton";
import { useGameStore } from "@/stores/game.store";
import { Icon } from "lucide-react";
import { bee } from "@lucide/lab";
function calculateSteps(fromPosition: number, toPosition: number, playerColor: string): number {
  if (fromPosition === -1) return 6;
  const startField = ({ RED: 0, BLUE: 13, YELLOW: 26, GREEN: 39 } as Record<string, number>)[playerColor] ?? 0;
  const goalStart = ({ RED: 52, BLUE: 57, YELLOW: 62, GREEN: 67 } as Record<string, number>)[playerColor] ?? 52;
  const finalGoal = ({ RED: 72, BLUE: 73, YELLOW: 74, GREEN: 75 } as Record<string, number>)[playerColor] ?? 72;

  if (fromPosition >= goalStart && fromPosition < goalStart + 5) {
    if (toPosition === finalGoal) {
      return 5 - (fromPosition - goalStart);
    }
    return toPosition - fromPosition;
  }

  const progressFromStart = (fromPosition - startField + 52) % 52;
  if (toPosition === finalGoal) {
    return 56 - progressFromStart;
  }
  if (toPosition >= goalStart && toPosition < goalStart + 5) {
    const goalIndex = toPosition - goalStart;
    return goalIndex + 51 - progressFromStart;
  }

  return (toPosition - fromPosition + 52) % 52;
}

interface DicePanelProps {
  currentRoll: number | null;
  onRoll: () => Promise<void>;
  disabled?: boolean;
  phase: string;
  PhaseIcon: React.ComponentType<{ className?: string }> | null;
  className?: string;
}

export function DicePanel({
  currentRoll,
  onRoll,
  disabled,
  phase,
  PhaseIcon,
  className,
}: DicePanelProps) {
  const [isNetworkRolling, setIsNetworkRolling] = useState(false);

  const isMyTurn = !disabled;
  const isVisible = currentRoll !== null;

  const possibleMoves = useGameStore((state) => state.possibleMoves);
  const selectedFigureId = useGameStore((state) => state.selectedFigureId);
  const selectedFigure = useGameStore((state) => {
    if (!state.selectedFigureId) return null;
    return state.figures.find(f => String(f.id) === state.selectedFigureId);
  });
  const hasFly = selectedFigure?.hasPlagueFly ?? false;

  const isPlagueFlyActive = useGameStore((state) =>
    state.gameState?.activeRules?.includes("PLAGUE_FLY") ?? false
  );
  const playerColor = useGameStore((state) => {
    const player = state.gameState?.players?.find((p) => p.id === selectedFigure?.playerId);
    return player ? player.color : null;
  });

  const displayFlyCount = selectedFigure && selectedFigure.hasPlagueFly
    ? Math.min(3, (selectedFigure.flyDebuffCount ?? 0) + 1)
    : 0;

  const flyDebuff = (() => {
    if (!selectedFigure || !selectedFigure.hasPlagueFly) return null;

    if (currentRoll !== null) {
      const move = possibleMoves.find((m) => String(m.figureId) === selectedFigureId);
      if (move && move.fromPosition !== -1 && playerColor) {
        const actualSteps = calculateSteps(move.fromPosition, move.toPosition, playerColor);
        const calculatedDebuff = currentRoll - actualSteps;
        if (calculatedDebuff > 0) return calculatedDebuff;
      }
    }
    return displayFlyCount || 1;
  })();

  const handleRollClick = async () => {
    if (disabled || isNetworkRolling) return;

    setIsNetworkRolling(true);

    try {
      await onRoll();
    } finally {
      setIsNetworkRolling(false);
    }
  };

  const isButtonDisabled = disabled || isNetworkRolling;

  return (
    <div
      className={`relative bg-primary border rounded-2xl lg:rounded-3xl py-2 sm:py-3 lg:py-5 px-3 lg:px-4 flex flex-col items-center justify-center w-full h-full lg:h-auto mx-auto shrink-0 min-w-0 transition-all duration-700 ease-[cubic-bezier(0.5,1.5,0.4,1)] overflow-hidden ${className} ${
        isMyTurn
          ? "border-white scale-[1.03]"
          : "border-accent opacity-60 hover:border-white"
      }`}
    >
      {isMyTurn && (
        <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />
      )}

      <div
        className={`flex items-center justify-center gap-2 mb-1 sm:mb-2 lg:mb-4 drop-shadow-md transition-colors duration-300 ${
          isMyTurn ? "text-white" : "text-white/50"
        }`}
      >
        {PhaseIcon && <PhaseIcon className="w-5 h-5 shrink-0 opacity-90" />}
        <p className="text-md lg:text-lg font-lilita uppercase tracking-[0.02em] text-center">
          {phase}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 my-2">
        <div
          className={`transition-all duration-300 ${isMyTurn ? "scale-105" : "opacity-40"} ${
            !isVisible && !isNetworkRolling ? "invisible" : ""
          }`}
        >
          <Dice value={currentRoll ?? 0} isSpinning={isNetworkRolling} />
        </div>

        {isPlagueFlyActive && hasFly && (
          <div className="flex flex-col items-start gap-1">
            <span className="font-afacad font-bold text-xs uppercase text-white/80 leading-none">
              FLIEGEN
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < displayFlyCount;
                return (
                  <div
                    key={idx}
                    className="w-5 h-5 flex items-center justify-center transition-all duration-300"
                    style={{ opacity: isActive ? 1.0 : 0.2 }}
                  >
                    <Icon iconNode={bee} className="w-full h-full text-white" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="relative w-full">
        <DiceButton
          onClick={handleRollClick}
          disabled={isButtonDisabled}
          shouldPulse={isMyTurn && !isNetworkRolling}
        />
        {hasFly && flyDebuff !== null && (
          <div className="absolute -top-[8px] -right-[4px] w-6 h-6 bg-[#282828] border border-[#797979] rounded-full flex items-center justify-center shadow-md pointer-events-none z-20">
            <span className="font-lilita text-xs text-white leading-none">
              -{flyDebuff}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
