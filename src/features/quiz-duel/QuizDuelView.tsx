import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VersusLogo } from "@/components/ui/VS";
import { useGameStore } from "@/stores/game.store";
import type { ActiveQuizType, PlayerColor } from "@/api/types";
import type { NotificationData } from "../game/NotificationPanel";

interface QuizDuelViewProps {
  activeQuiz: ActiveQuizType;
  currentUserId: string;
  onSubmitAnswer: (answer: "A" | "B" | "C" | "D") => void;
  onDuelResolved: (notification: NotificationData) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NormalizedOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

const COLOR_HEX_MAP: Record<PlayerColor, string> = {
  BLUE: "var(--color-blue)",
  YELLOW: "var(--color-yellow)",
  GREEN: "var(--color-green)",
  RED: "var(--color-red)",
};

export const QuizDuelView: React.FC<QuizDuelViewProps> = ({
  activeQuiz,
  currentUserId,
  onSubmitAnswer,
  onDuelResolved,
  open,
  onOpenChange,
}) => {
  const TOTAL_TIME = Number(activeQuiz.timeLimitSeconds) || 15;

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [localSelection, setLocalSelection] = useState<
    "A" | "B" | "C" | "D" | null
  >(null);

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseTriggeredRef = useRef<boolean>(false);
  const notificationFiredRef = useRef<boolean>(false);

  const storePlayers = useGameStore((state) => state.players) || [];
  const attackerName =
    storePlayers.find((p) => p.id === activeQuiz.attackerId)?.username ||
    "Player 1";
  const defenderName =
    storePlayers.find((p) => p.id === activeQuiz.defenderId)?.username ||
    "Player 2";

  const isUserAttacker = currentUserId === activeQuiz.attackerId;
  const userName = isUserAttacker ? attackerName : defenderName;
  const opponentName = isUserAttacker ? defenderName : attackerName;

  const userAnswer = isUserAttacker
    ? activeQuiz.attackerAnswer
    : activeQuiz.defenderAnswer;
  const opponentAnswer = isUserAttacker
    ? activeQuiz.defenderAnswer
    : activeQuiz.attackerAnswer;

  const selectedAnswer =
    (userAnswer as "A" | "B" | "C" | "D" | null) || localSelection;

  const hasUserAnswered = userAnswer !== null && userAnswer !== undefined;
  const hasOpponentAnswered =
    opponentAnswer !== null && opponentAnswer !== undefined;

  const isDuelEvaluated =
    (typeof activeQuiz.attackerCorrect === "boolean" &&
      typeof activeQuiz.defenderCorrect === "boolean") ||
    (timeLeft <= 0 && hasUserAnswered && hasOpponentAnswered);

  const isUserCorrect = isUserAttacker
    ? activeQuiz.attackerCorrect
    : activeQuiz.defenderCorrect;
  const isOpponentCorrect = isUserAttacker
    ? activeQuiz.defenderCorrect
    : activeQuiz.attackerCorrect;

  const category = activeQuiz.category || "Allgemeinwissen";
  const questionText =
    activeQuiz.question || activeQuiz.questionText || "Lade Frage...";

  const normalizedOptions: NormalizedOption[] = (() => {
    if (activeQuiz.answers && activeQuiz.answers.length > 0) {
      return activeQuiz.answers.map((opt, index) => ({
        key: ["A", "B", "C", "D"][index] as "A" | "B" | "C" | "D",
        text: opt.text,
      }));
    }
    if (activeQuiz.options && activeQuiz.options.length > 0) {
      return activeQuiz.options.map((opt) => ({
        key: opt.key,
        text: opt.text,
      }));
    }
    return [];
  })();

  const attackerColor =
    storePlayers.find((p) => p.id === activeQuiz.attackerId)?.color || "BLUE";
  const defenderColor =
    storePlayers.find((p) => p.id === activeQuiz.defenderId)?.color || "RED";

  useEffect(() => {
    setTimeLeft(TOTAL_TIME);
    setLocalSelection(null);
    startTimeRef.current = null;
    autoCloseTriggeredRef.current = false;
    notificationFiredRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [activeQuiz.id, TOTAL_TIME]);

  useEffect(() => {
    if (isDuelEvaluated && !notificationFiredRef.current) {
      notificationFiredRef.current = true;

      let title = "QUIZ BEENDET";
      let message = "Das Duell endete unentschieden!";
      let iconType: "WIN" | "INFO" = "INFO";

      if (isUserCorrect && !isOpponentCorrect) {
        title = "SIEG";
        message = "Du hast das Quizduell glorreich gewonnen!";
        iconType = "WIN";
      } else if (!isUserCorrect && isOpponentCorrect) {
        title = "NIEDERLAGE";
        message = `${opponentName} war im Quizduell klüger.`;
      } else if (!isUserCorrect && !isOpponentCorrect) {
        message = "Beide Spieler lagen komplett falsch!";
      }

      onDuelResolved({
        title,
        message,
        iconType,
        extraText: category,
      });
    }
  }, [
    isDuelEvaluated,
    isUserCorrect,
    isOpponentCorrect,
    category,
    onDuelResolved,
    opponentName,
  ]);

  useEffect(() => {
    if (timeLeft <= 0 || isDuelEvaluated) {
      if (isDuelEvaluated && !autoCloseTriggeredRef.current) {
        autoCloseTriggeredRef.current = true;
        timeoutRef.current = setTimeout(() => {
          onOpenChange(false);
        }, 4000);
      }
      return;
    }

    if (hasUserAnswered && hasOpponentAnswered) return;

    const updateTimer = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;
      const remaining = Math.max(TOTAL_TIME - elapsedSeconds, 0);

      setTimeLeft(remaining);

      if (remaining > 0) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    hasUserAnswered,
    hasOpponentAnswered,
    timeLeft,
    TOTAL_TIME,
    isDuelEvaluated,
    onOpenChange,
    activeQuiz.id,
  ]);

  const handleAnswerClick = (optionKey: "A" | "B" | "C" | "D") => {
    if (hasUserAnswered || timeLeft <= 0 || isDuelEvaluated) return;
    setLocalSelection(optionKey);
    onSubmitAnswer(optionKey);
  };

  const radius = 22;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset =
    TOTAL_TIME > 0
      ? circumference - (timeLeft / TOTAL_TIME) * circumference
      : circumference;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-primary border border-accent text-white rounded-4xl p-4 md:p-8 shadow-2xl w-[calc(100%-2rem)] max-w-4xl backdrop-blur-xl select-none"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 text-red hover:opacity-80 transition-opacity bg-transparent border-none outline-none z-10"
          aria-label="Close Quiz Duel"
        >
          <X className="w-7 h-7 md:w-9 md:h-9 stroke-[2.5]" />
        </button>

        <div className="relative flex flex-col items-center text-center mt-1">
          <h2 className="text-3xl md:text-6xl tracking-wider text-white font-lilita uppercase mb-2 md:mb-4">
            QUIZDUELL
          </h2>

          <div className="flex items-center justify-center gap-4 w-full px-4 mb-2">
            <span
              className="font-lilita text-xl md:text-3xl tracking-wide max-w-[40%] truncate"
              style={{ color: COLOR_HEX_MAP[attackerColor] }}
            >
              {attackerName}
            </span>
            <VersusLogo
              className="w-16 md:w-28 h-auto shrink-0"
              leftColor={COLOR_HEX_MAP[attackerColor] || "var(--color-blue)"}
              rightColor={COLOR_HEX_MAP[defenderColor] || "var(--color-blue)"}
            />
            <span
              className="font-lilita text-xl md:text-3xl tracking-wide max-w-[40%] truncate"
              style={{ color: COLOR_HEX_MAP[defenderColor] }}
            >
              {defenderName}
            </span>
          </div>
        </div>

        <div className="relative mt-8 md:mt-12 bg-primary border border-accent rounded-3xl p-4 md:p-8 flex flex-col items-center gap-4 md:gap-6">
          <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#736ced] text-white p-4 text-lg font-bold uppercase tracking-widest rounded-full border-none font-sans whitespace-nowrap z-10">
            {category}
          </Badge>

          <div className="pt-2 md:pt-4 w-full flex flex-col items-center justify-center gap-2">
            {isDuelEvaluated ? (
              <div className="flex flex-col items-center gap-1.5">
                {isUserCorrect && !isOpponentCorrect && (
                  <div className="bg-green/20 border-2 border-green px-6 py-2 rounded-xl text-green text-sm md:text-base font-black tracking-wider uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> DU HAST GEWONNEN!
                  </div>
                )}
                {!isUserCorrect && isOpponentCorrect && (
                  <div className="bg-red/20 border-2 border-red px-6 py-2 rounded-xl text-red text-sm md:text-base font-black tracking-wider uppercase flex items-center gap-2">
                    <XCircle className="w-5 h-5" /> GEGNER HAT GEWONNEN!
                  </div>
                )}
                {isUserCorrect && isOpponentCorrect && (
                  <div className="bg-yellow/20 border-2 border-yellow px-6 py-2 rounded-xl text-yellow text-sm md:text-base font-black tracking-wider uppercase flex items-center gap-2">
                    UNENTSCHIEDEN! (BEIDE RICHTIG)
                  </div>
                )}
                {!isUserCorrect && !isOpponentCorrect && (
                  <div className="bg-neutral-700/50 border-2 border-neutral-500 px-6 py-2 rounded-xl text-neutral-300 text-sm md:text-base font-black tracking-wider uppercase flex items-center gap-2">
                    KEINER HAT RECHT!
                  </div>
                )}
              </div>
            ) : timeLeft > 0 ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center relative">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 60 60"
                  >
                    <circle
                      cx="30"
                      cy="30"
                      r={radius}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r={radius}
                      stroke="var(--color-green)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-sm md:text-base font-sans font-black text-green">
                    {Math.ceil(timeLeft)}s
                  </span>
                </div>
                {hasUserAnswered && !hasOpponentAnswered && (
                  <span className="text-xs text-neutral-400 font-bold tracking-wide flex items-center gap-1.5 animate-pulse">
                    <Hourglass className="w-3.5 h-3.5" /> Warte auf die Antwort
                    des Gegners...
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-red border border-red mt-4 md:mt-0 px-4 py-1.5 md:px-6 md:py-2 rounded-xl text-white text-xs md:text-sm font-black tracking-wider uppercase">
                ZEIT ABGELAUFEN!
              </div>
            )}
          </div>

          <p className="text-center font-bold text-base md:text-2xl px-2 md:px-4 leading-snug max-w-2xl tracking-wide text-white">
            {questionText}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
            {normalizedOptions.map((option) => {
              const optionKey = option.key;
              const optionText = option.text || "Antwort Ladefehler";

              const isUserSelection = selectedAnswer === optionKey;
              const isOpponentSelection =
                hasOpponentAnswered && opponentAnswer === optionKey;

              let buttonVariantStyle =
                "bg-[#736ced] border-transparent text-white";

              if (isDuelEvaluated) {
                const isThisOptionCorrect =
                  (isUserAttacker &&
                    optionKey === activeQuiz.attackerAnswer &&
                    activeQuiz.attackerCorrect) ||
                  (!isUserAttacker &&
                    optionKey === activeQuiz.defenderAnswer &&
                    activeQuiz.defenderCorrect) ||
                  (isUserAttacker &&
                    optionKey === activeQuiz.defenderAnswer &&
                    activeQuiz.defenderCorrect) ||
                  (!isUserAttacker &&
                    optionKey === activeQuiz.attackerAnswer &&
                    activeQuiz.attackerCorrect);

                if (isThisOptionCorrect) {
                  buttonVariantStyle =
                    "bg-green border-green text-white font-black";
                } else if (isUserSelection && !isUserCorrect) {
                  buttonVariantStyle =
                    "bg-red border-red text-white opacity-90";
                } else {
                  buttonVariantStyle =
                    "bg-neutral-800 border-neutral-700 text-neutral-400 opacity-40";
                }
              } else if (isUserSelection) {
                buttonVariantStyle = "bg-[#6159db] border-accent text-white";
              }

              return (
                <Button
                  key={optionKey}
                  disabled={hasUserAnswered || timeLeft <= 0 || isDuelEvaluated}
                  onClick={() => handleAnswerClick(optionKey)}
                  variant="ghost"
                  className={`min-h-14 md:min-h-16 h-auto py-3 md:py-4 flex items-center justify-start gap-3 md:gap-4 px-4 md:px-5 rounded-xl text-left font-bold transition-all shadow-sm font-sans whitespace-normal break-words border-2 relative ${buttonVariantStyle} disabled:pointer-events-none`}
                >
                  <div className="flex items-center justify-center min-w-[24px] min-h-[24px] md:min-w-[28px] md:min-h-[28px] rounded-full bg-primary text-white text-xs font-extrabold shadow-inner shrink-0">
                    {optionKey}
                  </div>

                  <span className="text-base md:text-lg tracking-wide flex-1">
                    {optionText}
                  </span>

                  {isDuelEvaluated &&
                    (isUserSelection || isOpponentSelection) && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 z-10">
                        {isUserSelection && (
                          <span
                            className="text-[10px] md:text-xs uppercase px-2 py-0.5 rounded font-black tracking-wider border text-white bg-black/50"
                            style={{
                              borderColor: COLOR_HEX_MAP[attackerColor],
                            }}
                          >
                            {userName}
                          </span>
                        )}
                        {isOpponentSelection && (
                          <span
                            className="text-[10px] md:text-xs uppercase px-2 py-0.5 rounded font-black tracking-wider border bg-black/50"
                            style={{
                              color:
                                COLOR_HEX_MAP[
                                  isUserAttacker ? defenderColor : attackerColor
                                ],
                              borderColor:
                                COLOR_HEX_MAP[
                                  isUserAttacker ? defenderColor : attackerColor
                                ],
                            }}
                          >
                            {opponentName}
                          </span>
                        )}
                      </div>
                    )}
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
