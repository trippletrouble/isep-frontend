import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton"

interface DicePanelProps {
  currentRoll: number | null;
  onRoll: () => void;
  disabled?: boolean;
  className?: string;
}

export function DicePanel({ currentRoll, onRoll, disabled, className }: DicePanelProps) {
  const shouldPulse = !disabled;
  const isVisible = currentRoll !== null;

  return (
    <div className={`bg-primary border rounded-2xl lg:rounded-4xl py-4 lg:py-8 px-3 lg:px-6 flex flex-col items-center justify-center w-full h-full lg:h-auto mx-auto shrink-0 min-w-0 transition-all duration-700 ease-[cubic-bezier(0.5,1.5,0.4,1)] ${className} ${
        shouldPulse ? "border-white shadow-[0_0_25px_rgba(255,255,255,0.15)]" : "border-accent hover:border-white"
    }`}>
      <h2 className="text-lg lg:text-3xl text-white font-lilita uppercase tracking-[0.02em] mb-3 lg:mb-6 drop-shadow-md">
        Würfel
      </h2>
      
      <div className={`transition-all duration-300 ${shouldPulse ? "scale-105" : ""} ${!isVisible ? "invisible" : ""}`}>
        <Dice value={currentRoll ?? 0} />
      </div>

      <DiceButton onClick={onRoll} disabled={disabled} shouldPulse={shouldPulse} />
    </div>
  );
}