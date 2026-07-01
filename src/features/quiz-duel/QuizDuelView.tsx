import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VersusLogo } from "@/components/ui/VS";
import type { ActiveQuizType, PlayerColor } from "@/api/types";

interface QuizDuelViewProps {
  activeQuiz: ActiveQuizType;
  currentUserId: string;
  onSubmitAnswer: (answer: "A" | "B" | "C" | "D") => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  open,
  onOpenChange,
}) => {
  const TOTAL_TIME = activeQuiz.timeLimitSeconds || 10;

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<
    "A" | "B" | "C" | "D" | null
  >(null);

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseTriggeredRef = useRef<boolean>(false);

  const isAttacker = currentUserId === activeQuiz.attackerId;
  const hasAnswered = isAttacker
    ? !!activeQuiz.attackerAnswer
    : !!activeQuiz.defenderAnswer;

  const category = activeQuiz.category || "KUNST & KULTUR";
  const questionText = activeQuiz.questionText || "";
  const options = activeQuiz.options || [];

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!hasAnswered && !autoCloseTriggeredRef.current) {
        autoCloseTriggeredRef.current = true;
        timeoutRef.current = setTimeout(() => {
          onOpenChange(false);
        }, 3000);
      }
      return;
    }

    if (hasAnswered) return;

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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hasAnswered, timeLeft, TOTAL_TIME, onOpenChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAnswerClick = (optionKey: "A" | "B" | "C" | "D") => {
    if (hasAnswered || timeLeft <= 0) return;
    setSelectedAnswer(optionKey);
    onSubmitAnswer(optionKey);
  };

  const radius = 22;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (timeLeft / TOTAL_TIME) * circumference;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-primary border border-accent text-white rounded-4xl p-4 md:p-8 shadow-2xl w-[calc(100%-2rem)] max-w-4xl backdrop-blur-xl"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 text-red hover:opacity-80 transition-opacity bg-transparent border-none outline-none z-10"
          aria-label="Close Quiz Duel"
        >
          <X className="w-7 h-7 md:w-9 md:h-9 stroke-[2.5]" />
        </button>

        <div className="relative flex flex-col items-center text-center mt-1">
          <h2 className="text-3xl md:text-6xl tracking-wider text-white select-none font-lilita uppercase mb-2 md:mb-4">
            QUIZDUELL
          </h2>

          <VersusLogo
            className="w-24 md:w-40 h-auto"
            leftColor={
              COLOR_HEX_MAP[activeQuiz.attackerColor] || "var(--color-blue)"
            }
            rightColor={
              COLOR_HEX_MAP[activeQuiz.defenderColor] || "var(--color-blue)"
            }
          />
        </div>

        <div className="relative mt-8 md:mt-12 bg-primary border border-accent rounded-3xl p-4 md:p-8 flex flex-col items-center gap-4 md:gap-6">
          <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#736ced] text-white p-4 text-lg font-bold uppercase tracking-widest rounded-full border-none font-sans whitespace-nowrap z-10">
            {category}
          </Badge>

          <div className="pt-2 md:pt-4 w-full flex justify-center">
            {timeLeft > 0 ? (
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
            ) : (
              <div className="bg-red-600 border border-red-500 mt-4 md:mt-0 px-4 py-1.5 md:px-6 md:py-2 rounded-xl text-white text-xs md:text-sm font-black tracking-wider uppercase">
                ZEIT ABGELAUFEN!
              </div>
            )}
          </div>

          <p className="text-center font-bold text-base md:text-2xl px-2 md:px-4 leading-snug max-w-2xl tracking-wide text-white">
            {questionText}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
            {options.map((option) => {
              const optionKey = option.key as "A" | "B" | "C" | "D";
              const isCurrentSelection = selectedAnswer === optionKey;

              return (
                <Button
                  key={option.key}
                  disabled={hasAnswered || timeLeft <= 0}
                  onClick={() => handleAnswerClick(optionKey)}
                  variant="ghost"
                  className={`min-h-14 md:min-h-16 h-auto py-3 md:py-4 flex items-center justify-start gap-3 md:gap-4 px-4 md:px-5 rounded-xl text-left font-bold transition-all shadow-sm font-sans whitespace-normal break-words border-2
                  ${
                    isCurrentSelection
                      ? "bg-[#6159db] border-accent text-white hover:bg-[#6159db] active:bg-[#6159db]"
                      : "bg-[#736ced] border-transparent hover:bg-[#6159db] active:bg-[#6159db] text-white"
                  } 
                  disabled:opacity-60 disabled:pointer-events-none`}
                >
                  <div className="flex items-center justify-center min-w-[24px] min-h-[24px] md:min-w-[28px] md:min-h-[28px] rounded-full bg-primary text-white text-xs font-extrabold shadow-inner shrink-0">
                    {option.key}
                  </div>
                  <span className="text-base md:text-lg tracking-wide flex-1">
                    {option.text}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
