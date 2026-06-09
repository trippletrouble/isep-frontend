import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  const triggerTestNotification = () => {
    setNotification({
      title: "SCHLAG!",
      message: "Spieler 2 hat Spieler 1 vom Feld geworfen.",
      iconType: "CAPTURE",
      extraText: "+10 PUNKTE",
    });
  };

  return (
    <div className="h-screen bg-primary flex flex-col p-4 lg:p-6 overflow-hidden relative">
      <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none lg:hidden">
        <div className="pointer-events-auto max-w-[450px] mx-auto">
          <NotificationPanel
            data={notification}
            onClose={() => setNotification(null)}
          />
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto flex flex-col flex-1 min-h-0 items-center justify-center">
        <GameSubHeader />

        <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-12 items-center md:justify-center flex-1 min-h-0 mx-auto">
          <div className="flex flex-col justify-center items-center shrink min-w-0 min-h-0 order-2 lg:order-1">
            <div className="w-[80vw] h-[80vw] max-w-[80vh] max-h-[80vh] flex justify-center items-center">
              <Board diceRoll={currentRoll} />
            </div>

            <button
              onClick={triggerTestNotification}
              className="mt-4 shrink-0 text-white underline opacity-50 hover:opacity-100 font-afacad"
            >
              Test Notification Bounce
            </button>
          </div>

          <div className="w-[80vw] max-w-[80vh] lg:w-[350px] lg:max-w-none shrink-0 flex flex-row lg:flex-col gap-4 items-stretch justify-center order-1 lg:order-2">
            <div className="hidden lg:block w-full">
              <NotificationPanel
                data={notification}
                onClose={() => setNotification(null)}
              />
            </div>

            <LeaderboardPanel
              isSquished={!!notification}
              className="flex-1 lg:flex-none"
            />

            <DicePanel
              currentRoll={currentRoll}
              onRoll={setCurrentRoll}
              className="flex-1 lg:flex-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
