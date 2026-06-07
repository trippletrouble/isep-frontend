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
    <div className="bg-primary border border-[#797979] rounded-[3rem] p-8 flex flex-col items-center justify-center w-80 max-w-full mx-auto">
      <h2 className="text-4xl text-white font-lilita uppercase tracking-custom mb-8 drop-shadow-md">
        WÜRFEL
      </h2>
      <Dice value={currentRoll} />
      <DiceButton onClick={handleRollClick} />
    </div>
  );
}
