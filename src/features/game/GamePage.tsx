import { useState } from "react";
import Board from "../board/Board";
import { DicePanel } from "../dice/DicePanel";
import { GameSubHeader } from "./GameSubHeader";

export const GamePage = () => {
  const [currentRoll, setCurrentRoll] = useState(6);

  return (
    <div className="min-h-screen bg-primary flex flex-col p-4 lg:p-8">
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-1">
        <GameSubHeader />

        <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-12 items-start justify-center">
          <div className="w-full lg:w-[65%] max-w-[800px] flex flex-col">
            <Board diceRoll={currentRoll} />
          </div>

          <div className="w-full lg:w-[35%] max-w-[350px] flex flex-col gap-8">
            <DicePanel currentRoll={currentRoll} onRoll={setCurrentRoll} />
          </div>
        </div>
      </div>
    </div>
  );
};
