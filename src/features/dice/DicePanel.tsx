import { useState } from "react";
import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton";

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

      <div
        className={`transition-all duration-300 ${isMyTurn ? "scale-105" : "opacity-40"} ${
          !isVisible && !isNetworkRolling ? "invisible" : ""
        }`}
      >
        <Dice value={currentRoll ?? 0} isSpinning={isNetworkRolling} />
      </div>

      <DiceButton
        onClick={handleRollClick}
        disabled={isButtonDisabled}
        shouldPulse={isMyTurn && !isNetworkRolling}
      />
    </div>
  );
}
