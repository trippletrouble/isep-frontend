import { useState } from "react";
import Board from "../board/Board";
import { DicePanel } from "../dice/DicePanel";
import { GameSubHeader } from "./GameSubHeader";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { NotificationPanel, type NotificationData } from "./NotificationPanel";

export const GamePage = () => {
  const [currentRoll, setCurrentRoll] = useState(6);
  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );

  const triggerTestNotification = () => {
    setNotification({
      title: "SCHLAG!",
      message: "Spieler 2 hat Spieler 1 vom Feld geworfen.",
      iconType: "CAPTURE",
      extraText: "+10 PUNKTE",
    });
  };

  return (
    <div className="h-screen bg-primary flex flex-col p-4 lg:p-6 overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col flex-1 min-h-0">
        <GameSubHeader />

        <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-12 items-center lg:items-center justify-center flex-1 min-h-0">
          <div className="w-full lg:w-[65%] h-full flex flex-col justify-start min-h-0">
            <div className="flex-1 min-h-0 w-full h-full flex justify-center items-center">
              <Board diceRoll={currentRoll} />
            </div>

            <button
              onClick={triggerTestNotification}
              className="mt-4 text-white underline opacity-50 hover:opacity-100 font-afacad"
            >
              Test Notification Bounce
            </button>
          </div>

          <div className="w-full lg:w-[35%] max-w-[350px] flex flex-col relative">
            <NotificationPanel
              data={notification}
              onClose={() => setNotification(null)}
            />

            <LeaderboardPanel isSquished={!!notification} />

            <DicePanel currentRoll={currentRoll} onRoll={setCurrentRoll} />
          </div>
        </div>
      </div>
    </div>
  );
};
