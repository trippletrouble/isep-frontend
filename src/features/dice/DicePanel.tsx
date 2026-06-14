import { useState } from "react";
import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton";

interface DicePanelProps {
  currentRoll: number;
  onRoll: (roll: number) => void;
  className?: string;
}

export function DicePanel({ currentRoll, onRoll, className }: DicePanelProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [fakeRoll, setFakeRoll] = useState<number | null>(null);

  const displayValue = isRolling && fakeRoll !== null ? fakeRoll : currentRoll;

  const handleRollClick = () => {
    if (isRolling) return;

    setIsRolling(true);

    const absoluteFinalRoll = Math.floor(Math.random() * 6) + 1;

    const shuffleTimings = [150, 400];
    shuffleTimings.forEach((ms) => {
      setTimeout(() => {
        setFakeRoll(Math.floor(Math.random() * 6) + 1);
      }, ms);
    });

    setTimeout(() => {
      setFakeRoll(absoluteFinalRoll);
    }, 750);

    setTimeout(() => {
      onRoll(absoluteFinalRoll);
      setFakeRoll(null);
      setIsRolling(false);
    }, 1000);
  };

  return (
    <div
      className={`bg-primary border border-accent hover:border-white rounded-2xl lg:rounded-4xl p-4 lg:p-8 flex flex-col gap-4 md:gap-6 items-center justify-center w-full h-full lg:h-auto mx-auto shrink-0 min-w-0 transition-all duration-700 ease-[cubic-bezier(0.5,1.5,0.4,1)] ${className}`}
    >
      <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl text-white font-lilita uppercase tracking-[0.02em]">
        Würfel
      </h2>

      <Dice value={displayValue} isRolling={isRolling} />

      <DiceButton onClick={handleRollClick} disabled={isRolling} />
    </div>
  );
}
