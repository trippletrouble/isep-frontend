import { useState } from "react";
import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton";
import { useGameStore } from '@/stores/game.store';
import fliegeIcon from "@/assets/fliege.png";

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
  onRoll: () => void;
  disabled?: boolean;
  phase: string;
  PhaseIcon: React.ComponentType<{ className?: string }> | null;
  className?: string;
}

export function DicePanel({
  currentRoll,
  onRoll,
  disabled,
  className,
}: DicePanelProps) {
  const isMyTurn = !disabled;
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

  const selectedFigureId = useGameStore((state) => state.selectedFigureId);
  const selectedFigure = useGameStore((state) => {
    if (!state.selectedFigureId) return null;
    return state.figures.find(f => String(f.id) === state.selectedFigureId);
  });
  const hasFly = selectedFigure?.hasPlagueFly ?? false;
  const flyDebuffCount = selectedFigure?.flyDebuffCount ?? 0;
  const isPlagueFlyActive = useGameStore((state) =>
    state.gameState?.activeRules?.includes("PLAGUE_FLY") ?? false
  );
  const playerColor = useGameStore((state) => {
    const player = state.gameState?.players?.find((p) => p.id === selectedFigure?.playerId);
    return player ? player.color : null;
  });

  const flyDebuff = (() => {
    if (!selectedFigure || !selectedFigure.hasPlagueFly) return null;

    if (currentRoll !== null) {
      const possibleMoves = useGameStore.getState().possibleMoves;
      const move = possibleMoves.find((m) => String(m.figureId) === selectedFigureId);
      if (move && move.fromPosition !== -1 && playerColor) {
        const actualSteps = calculateSteps(move.fromPosition, move.toPosition, playerColor);
        const calculatedDebuff = currentRoll - actualSteps;
        if (calculatedDebuff > 0) return calculatedDebuff;
      }
    }
    return 1;
  })();

  const displayFlyCount = hasFly ? (flyDebuff ?? 1) : 0;

  const handleRollClick = () => {
    if (disabled || isLocalRolling || currentAwaitingState) return;

    setIsLocalRolling(true);
    setAwaitingServerPhaseUpdate(true);
    onRoll();

    setTimeout(() => {
      setIsLocalRolling(false);
    }, 1000);
  };

  const isButtonDisabled = disabled || isLocalRolling || currentAwaitingState;

  return (
    <div className="flex flex-col items-center w-full max-w-[391px] mx-auto shrink-0 select-none">
      <div
        className={`relative bg-[#282828] border border-[#797979] shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] rounded-[40px] flex flex-col items-center justify-start w-full h-[330px] pt-[26px] pb-[20px] px-6 transition-all duration-700 ease-[cubic-bezier(0.5,1.5,0.4,1)] ${className} ${
          isMyTurn && !currentAwaitingState
            ? "scale-[1.03]"
            : "opacity-60"
        }`}
      >
        {isMyTurn && !currentAwaitingState && (
          <div className="absolute inset-0 bg-white/5 animate-pulse rounded-[40px] pointer-events-none" />
        )}

        <div className="flex items-center justify-center mb-[20px] drop-shadow-md">
          <p className="text-[36px] font-lilita uppercase tracking-[0.04em] text-center text-white leading-[41px]">
            WÜRFEL
          </p>
        </div>

        <div className="flex items-center gap-[45px] mb-[25px] justify-center min-w-0 w-full">
          <div className="relative w-[123px] h-[123px] flex items-center justify-center shrink-0">
            {/* Background Glow */}
            <div className="absolute -top-[13px] -left-[13px] w-[150px] h-[150px] bg-[#FFFBFB]/20 rounded-full blur-[12.5px] pointer-events-none" />
            
            {/* Dice wrapper */}
            <div className="relative z-10 transition-all duration-300">
              <Dice value={currentRoll ?? 0} isRolling={isLocalRolling} />
            </div>
          </div>

          {/* Fliegen debuff layout next to the dice */}
          {isPlagueFlyActive && (
            <div className="flex flex-col items-start justify-center gap-[5px] h-[64px] shrink-0">
              <span className="font-afacad font-bold text-[24px] uppercase tracking-[0.02em] text-white leading-none">
                FLIEGEN
              </span>
              <div className="flex items-center gap-[5px] h-[35px]">
                {[0, 1, 2].map((idx) => {
                  const isActive = idx < displayFlyCount;
                  return (
                    <div
                      key={idx}
                      className="w-[28px] h-[35px] transition-all duration-300"
                      style={{
                        opacity: isActive ? 1.0 : 0.2,
                        filter: "brightness(0) invert(1)",
                      }}
                    >
                      <img
                        src={fliegeIcon}
                        alt="Pestfliege"
                        className="w-[28px] h-[35px] object-contain"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="relative w-[262px] mx-auto mt-auto">
          <DiceButton
            onClick={handleRollClick}
            disabled={isButtonDisabled}
            shouldPulse={isMyTurn && !currentAwaitingState}
          />
          {hasFly && flyDebuff !== null && (
            <div className="absolute -top-[16px] -right-[10px] w-[33px] h-[33px] bg-[#282828] border border-[#797979] rounded-full flex items-center justify-center shadow-[0px_4px_22.2px_rgba(0,0,0,0.25)] pointer-events-none">
              <span className="font-lilita text-[18px] text-white leading-none uppercase">
                -{flyDebuff}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
