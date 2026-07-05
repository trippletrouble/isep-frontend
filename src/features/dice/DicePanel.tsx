import { useState } from "react";
import { useParams } from "react-router-dom";
import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton";
import { useGameStore } from '@/stores/game.store'
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
  onRoll: (customValue?: number) => void;
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
  const { id: sessionId } = useParams<{ id: string }>();
  const isSandbox = sessionId === "sandbox" || window.location.pathname.endsWith("/sandbox");

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

  const handleRollClick = () => {
    if (disabled || isLocalRolling || currentAwaitingState) return;

    setIsLocalRolling(true);
    setAwaitingServerPhaseUpdate(true);
    onRoll();

    setTimeout(() => {
      setIsLocalRolling(false);
    }, 1000);
  };

  const handleCheatRoll = (num: number) => {
    if (disabled || isLocalRolling || currentAwaitingState) return;

    setIsLocalRolling(true);
    setAwaitingServerPhaseUpdate(true);
    onRoll(num);

    setTimeout(() => {
      setIsLocalRolling(false);
    }, 1000);
  };

  const isButtonDisabled = disabled || isLocalRolling || currentAwaitingState;

  return (
    <div
      className={`relative bg-primary border rounded-2xl lg:rounded-3xl py-2 sm:py-3 lg:py-5 px-3 lg:px-4 flex flex-col items-center justify-center w-full h-full lg:h-auto mx-auto shrink-0 min-w-0 transition-all duration-700 ease-[cubic-bezier(0.5,1.5,0.4,1)] overflow-hidden ${className} ${
        isMyTurn && !currentAwaitingState
          ? "border-white scale-[1.03]"
          : "border-accent opacity-60 hover:border-white"
      }`}
    >
      {isMyTurn && !currentAwaitingState && (
        <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />
      )}

      <div
        className={`flex items-center justify-center gap-2 mb-1 sm:mb-2 lg:mb-4 drop-shadow-md transition-colors duration-300 ${
          isMyTurn && !currentAwaitingState ? "text-white" : "text-white/50"
        }`}
      >
        <p className="text-2xl sm:text-3xl lg:text-[36px] font-lilita uppercase tracking-[0.04em] text-center text-white">
          WÜRFEL
        </p>
      </div>

      <div className="flex items-center gap-6 mb-4 lg:mb-6 justify-center min-w-0">
        <div
          className={`transition-all duration-300 ${isMyTurn ? "scale-105" : "opacity-40"}`}
        >
          <Dice value={currentRoll ?? 0} isRolling={isLocalRolling} />
        </div>

        {/* Fliegen debuff layout next to the dice */}
        {hasFly && (
          <div className="flex flex-col items-center justify-center gap-1.5 h-14 md:h-[120px]">
            <span className="font-afacad font-bold text-sm lg:text-[16px] uppercase tracking-[0.1em] text-white leading-none">
              FLIEGEN
            </span>
            <div className="flex items-center gap-[5px] h-[35px]">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < flyDebuffCount;
                return (
                  <div
                    key={idx}
                    className="w-[28px] h-[35px] transition-all duration-300"
                    style={{
                      opacity: isActive ? 1.0 : 0.2,
                      filter: "brightness(0) invert(1)"
                    }}
                  >
                    <img src={fliegeIcon} alt="Pestfliege" className="w-[28px] h-[35px] object-contain" />
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
          shouldPulse={isMyTurn && !currentAwaitingState}
        />
        {hasFly && currentRoll !== null && flyDebuff !== null && (
          <div className="absolute -top-[10px] -right-[6px] bg-black text-white text-xs lg:text-[14px] font-bold font-afacad w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg pointer-events-none">
            -{flyDebuff}
          </div>
        )}
        {isSandbox && !disabled && (
          <div className="flex items-center justify-center gap-1.5 mt-3 w-full">
            <span className="text-[10px] text-white/50 font-afacad font-bold uppercase tracking-wider mr-1">
              Wurf:
            </span>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => handleCheatRoll(num)}
                className="w-7 h-7 bg-white/10 hover:bg-white/30 text-white font-lilita rounded-lg text-sm flex items-center justify-center border border-white/20 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
