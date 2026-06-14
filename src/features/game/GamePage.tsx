import { useState, useEffect } from "react";
import Board from "../board/Board";
import { DicePanel } from "../dice/DicePanel";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { NotificationPanel, type NotificationData } from "./NotificationPanel";
import { PageSubHeader } from "@/components/layout/PageSubHeader";

export const GamePage = () => {
  const [currentRoll, setCurrentRoll] = useState(6);
  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsDesktop(window.innerWidth >= 1024);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

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
    <div className="w-full h-full min-h-[calc(100vh-140px)] bg-primary flex flex-col items-center justify-center relative">
      <div className="fixed top-3 left-4 right-4 z-50 pointer-events-none lg:hidden">
        <div className="pointer-events-auto max-w-[380px] mx-auto">
          <NotificationPanel
            data={notification}
            onClose={() => setNotification(null)}
          />
        </div>
      </div>

      <PageSubHeader center="LOBBY #42" />

      <div className="w-full flex flex-col items-center justify-center flex-1">
        <div className="flex flex-col lg:flex-row w-full gap-6 lg:gap-8 items-center justify-center flex-1 mx-auto">
          <div className="flex flex-col order-2 lg:order-1 items-center justify-center">
            <div className="w-[80vw] h-[70vw] max-w-[70vh] max-h-[70vh] flex justify-center items-center">
              <Board diceRoll={currentRoll} />
            </div>

            <button
              onClick={triggerTestNotification}
              className="mt-3 shrink-0 text-sm text-white underline opacity-50 hover:opacity-100 font-afacad"
            >
              Test Notification Bounce
            </button>
          </div>

          <div className="w-[70vw] max-w-[70vh] lg:w-[290px] lg:max-w-none shrink-0 flex flex-row lg:flex-col gap-3 items-stretch justify-center order-1 lg:order-2 transition-all h-[180px] sm:h-[240px] lg:h-[480px]">
            <div className="hidden lg:block w-full">
              <NotificationPanel
                data={notification}
                onClose={() => setNotification(null)}
              />
            </div>

            <LeaderboardPanel
              isSquished={!!notification && isDesktop}
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
