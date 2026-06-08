import { Dice } from "./Dice";
import { DiceButton } from "./DiceButton";

interface DicePanelProps {
  currentRoll: number;
  onRoll: (roll: number) => void;
}

export function DicePanel({ currentRoll, onRoll }: DicePanelProps) {
  const handleRollClick = () => {
    const newRoll = Math.floor(Math.random() * 6) + 1;
    onRoll(newRoll);
  };

  return (
    <div className="bg-primary border border-accent hover:border-white rounded-4xl py-8 px-6 flex flex-col items-center justify-center w-full mx-auto shrink-0 transition-all duration-700 ease-[cubic-bezier(0.5,1.5,0.4,1)]">
      <h2 className="text-3xl text-white font-lilita uppercase tracking-[0.02em] mb-6 drop-shadow-md">
        Würfel
      </h2>
      <Dice value={currentRoll} />
      <DiceButton onClick={handleRollClick} />
    </div>
  );
}
