import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton";

interface DicePanelProps {
  currentRoll: number;
  onRoll: () => void;
  disabled?: boolean;
  className?: string;
}

export function DicePanel({ currentRoll, onRoll, disabled, className }: DicePanelProps) {
  return (
    <div
      className={`bg-primary border border-accent hover:border-white rounded-2xl lg:rounded-4xl py-4 lg:py-8 px-3 lg:px-6 flex flex-col items-center justify-center w-full h-full lg:h-auto mx-auto shrink-0 min-w-0 transition-all duration-700 ease-[cubic-bezier(0.5,1.5,0.4,1)] ${className}`}
    >
      <h2 className="text-lg lg:text-3xl text-white font-lilita uppercase tracking-[0.02em] mb-3 lg:mb-6 drop-shadow-md">
        Würfel
      </h2>
      <Dice value={currentRoll} />
      <DiceButton onClick={onRoll} disabled={disabled} />
    </div>
  );
}
