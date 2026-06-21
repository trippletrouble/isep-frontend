import { useState } from "react";
import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton";

interface DicePanelProps {
  currentRoll: number | null;
  onRoll: () => void;
  disabled?: boolean;
  phase: string;
  className?: string;
}

export function DicePanel({ currentRoll, onRoll, disabled, phase, className }: DicePanelProps) {
  const isMyTurn = !disabled;
  const isVisible = currentRoll !== null;

  const [isLocalRolling, setIsLocalRolling] = useState(false);

  const handleRollClick = () => {
    if (disabled) return;

    setIsLocalRolling(true);
    onRoll();

    // Setzt das lokale Rollen erst nach genau 1 Sekunde zurück
    setTimeout(() => {
      setIsLocalRolling(false);
    }, 1000);
  };

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

      <p className={`text-md lg:text-lg font-lilita uppercase tracking-[0.02em] mb-1 sm:mb-2 lg:mb-4 drop-shadow-md transition-colors duration-300 text-center ${
        isMyTurn ? "text-white" : "text-white/50"
      }`}>
        {phase}
      </p>

      <div
        className={`transition-all duration-300 ${isMyTurn ? "scale-105" : "opacity-40"} ${
          !isVisible && !isLocalRolling ? "invisible" : ""
        }`}
      >
        <Dice value={currentRoll ?? 0} isRolling={isLocalRolling} />
      </div>

      <DiceButton onClick={handleRollClick} disabled={disabled || isLocalRolling} shouldPulse={isMyTurn} />
    </div>
  );
}