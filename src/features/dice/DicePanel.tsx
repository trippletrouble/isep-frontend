import { useState } from "react";
import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton";
import { useGameStore } from "@/stores/game.store";
import { Icon } from "lucide-react";
import { bee } from "@lucide/lab";

// Helper to determine step difference based on UI settings
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
  onRoll: (customValue?: number) => void | Promise<void>;
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
  const [isLocalRolling, setIsLocalRolling] = useState(false);
  const [awaitingServerPhaseUpdate, setAwaitingServerPhaseUpdate] =
    useState(false);
  const [prevRoll, setPrevRoll] = useState<number | null>(currentRoll);

  let currentAwaitingState = awaitingServerPhaseUpdate;

  if (disabled && awaitingServerPhaseUpdate) {
    setAwaitingServerPhaseUpdate(false);
    currentAwaitingState = false;
  }

  if (currentRoll !== prevRoll) {
    setPrevRoll(currentRoll);
    setAwaitingServerPhaseUpdate(false);
    currentAwaitingState = false;
  }

  const possibleMoves = useGameStore((state) => state.possibleMoves);
  const selectedFigure = useGameStore((state) => {
    if (!state.selectedFigureId) return null;
    return state.figures.find(f => String(f.id) === state.selectedFigureId);
  });
  const targetFigureForFly = selectedFigure;
  const hasFly = targetFigureForFly?.hasPlagueFly ?? false;

  const isPlagueFlyActive = useGameStore((state) =>
    state.gameState?.activeRules?.includes("PLAGUE_FLY") ?? false
  ) && hasFly;
  const playerColor = useGameStore((state) => {
    const player = state.gameState?.players?.find((p) => p.id === targetFigureForFly?.playerId);
    return player ? player.color : null;
  });

  const displayFlyCount = targetFigureForFly && targetFigureForFly.hasPlagueFly
    ? Math.min(3, (targetFigureForFly.flyDebuffCount ?? 0) + 1)
    : 0;

  const flyDebuff = (() => {
    if (!targetFigureForFly || !targetFigureForFly.hasPlagueFly) return null;

    if (currentRoll !== null) {
      const move = possibleMoves.find((m) => String(m.figureId) === String(targetFigureForFly.id));
      if (move && move.fromPosition !== -1 && playerColor) {
        const actualSteps = calculateSteps(move.fromPosition, move.toPosition, playerColor);
        const calculatedDebuff = currentRoll - actualSteps;
        if (calculatedDebuff > 0) return calculatedDebuff;
      }
    }
    return displayFlyCount || 1;
  })();



  const handleRollClick = async () => {
    if (disabled || isLocalRolling || currentAwaitingState) return;

    setIsLocalRolling(true);
    setAwaitingServerPhaseUpdate(true);
    const startTime = Date.now();
    try {
      await onRoll();
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsed);
      setTimeout(() => {
        setIsLocalRolling(false);
      }, remainingTime);
    } catch (err) {
      setIsLocalRolling(false);
      setAwaitingServerPhaseUpdate(false);
    }
  };

  const isButtonDisabled = disabled || isLocalRolling || currentAwaitingState;
  const isMyTurn = !disabled;

  return (
    <div className="w-full shrink-0 select-none">
      <div
        className={`relative bg-[#282828] border border-white/10 shadow-2xl rounded-3xl flex flex-col items-center justify-between w-full h-[240px] md:h-[330px] p-6 transition-all duration-500 hover:border-white/20 ${className} ${
          isMyTurn && !currentAwaitingState
            ? "scale-[1.03] border-white/40"
            : "opacity-60"
        }`}
      >
        {isMyTurn && !currentAwaitingState && (
          <div className="absolute inset-0 bg-white/5 animate-pulse rounded-3xl pointer-events-none" />
        )}

        {/* Phase Header with Icon and Label */}
        <div
          className={`flex items-center justify-center gap-2 mb-3 md:mb-[20px] drop-shadow-md transition-colors duration-300 ${
            isMyTurn && !currentAwaitingState ? "text-white" : "text-white/50"
          }`}
        >
          {PhaseIcon && <PhaseIcon className="w-5 h-5 md:w-6 md:h-6 shrink-0 opacity-90" />}
          <p className="text-[16px] md:text-[22px] font-lilita uppercase tracking-[0.04em] text-center leading-none">
            {phase}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center mb-3 md:mb-[25px] justify-center min-w-0 w-full gap-3 md:gap-0">
          <div className={isPlagueFlyActive ? "flex md:flex-1 justify-center md:justify-end md:pr-8" : "flex justify-center"}>
            <div className="relative w-[85px] h-[85px] md:w-[123px] md:h-[123px] flex items-center justify-center shrink-0">
              {/* Background Glow */}
              <div className="absolute -top-[10px] -left-[10px] w-[105px] h-[105px] md:-top-[13px] md:-left-[13px] md:w-[150px] md:h-[150px] bg-[#FFFBFB]/20 rounded-full blur-[10px] md:blur-[12.5px] pointer-events-none" />
              
              {/* Dice wrapper */}
              <div className="relative z-10 transition-all duration-300 scale-90 md:scale-100">
                <Dice value={currentRoll ?? 0} isSpinning={isLocalRolling} />
              </div>
            </div>
          </div>

          {/* Separator (Desktop only) */}
          {isPlagueFlyActive && (
            <div className="hidden md:block w-[1px] h-[55px] bg-white/10 shrink-0" />
          )}

          {/* Fliegen debuff layout next to the dice */}
          {isPlagueFlyActive && (
            <div className="flex md:flex-1 justify-center md:justify-start md:pl-8">
              <div className="flex flex-col items-center md:items-start justify-center gap-1 md:gap-[5px] h-[48px] md:h-[64px] shrink-0">
                <span className="font-afacad font-bold text-[18px] md:text-[24px] uppercase tracking-[0.02em] text-white leading-none">
                  FLIEGE
                </span>
                <div className="flex items-center gap-2 h-[25px] md:h-[35px]">
                  <div
                    className="w-[20px] h-[25px] md:w-[28px] md:h-[35px] transition-all duration-300 flex items-center justify-center"
                    style={{
                      opacity: displayFlyCount > 0 ? 1.0 : 0.2,
                    }}
                  >
                    <Icon iconNode={bee} className="w-full h-full text-white" />
                  </div>
                  <span className="font-afacad font-semibold text-[14px] md:text-[18px] text-white/70">
                    {displayFlyCount > 0 ? `Stufe ${displayFlyCount}/3` : "Keine"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Pill: 3 -> 1 -2 (or -2 preview before roll) */}
        {hasFly && flyDebuff !== null && (
          <div className="flex justify-center mb-3">
            <div className="bg-[#282828] border border-white/10 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-md">
              {currentRoll !== null ? (
                <>
                  <span className="line-through text-white/50 font-lilita text-[18px] leading-none">
                    {currentRoll}
                  </span>
                  <span className="text-white/40 text-[14px] leading-none">→</span>
                  <span className="text-[#ebd536] font-lilita text-[22px] leading-none">
                    {Math.max(1, currentRoll - flyDebuff)}
                  </span>
                </>
              ) : (
                <span className="text-white/60 font-lilita text-[14px] leading-none uppercase tracking-wider">
                  Nächster Wurf:
                </span>
              )}
              <div className="w-[16px] h-[16px] flex items-center justify-center text-white/70 ml-0.5">
                <Icon iconNode={bee} className="w-full h-full text-white" />
              </div>
              <span className="font-lilita text-[15px] text-[#DB5757] font-bold leading-none">
                -{flyDebuff}
              </span>
            </div>
          </div>
        )}

        <div className="relative w-[200px] md:w-[262px] mx-auto mt-auto scale-90 md:scale-100">
          <DiceButton
            onClick={handleRollClick}
            disabled={isButtonDisabled}
            shouldPulse={isMyTurn && !currentAwaitingState}
          />
        </div>
      </div>
    </div>
  );
}
