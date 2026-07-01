import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActiveQuizType, PlayerColor } from "@/api/types";

interface QuizDuelViewProps {
  activeQuiz: ActiveQuizType;
  currentUserId: string;
  onSubmitAnswer: (answer: string) => void;
}

const COLOR_MAP: Record<PlayerColor, string> = {
  BLUE: "fill-blue text-blue",
  YELLOW: "fill-yellow text-yellow",
  GREEN: "fill-green text-green",
  RED: "fill-red text-red",
};

const LudoPieceSvg = ({ className }: { className: string }) => (
  <svg
    viewBox="0 0 24 32"
    className={`w-8 h-10 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="7" r="5" />
    <path d="M12 12c-4 0-7 3-7 8v2h14v-2c0-5-3-8-7-8z" />
    <path d="M3 24h18v4H3z" rx="1" />
  </svg>
);

export const QuizDuelView: React.FC<QuizDuelViewProps> = ({
  activeQuiz,
  currentUserId,
  onSubmitAnswer,
}) => {
  const TOTAL_TIME = activeQuiz.timeLimitSeconds || 18;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const isAttacker = currentUserId === activeQuiz.attackerId;
  const hasAnswered = isAttacker
    ? !!activeQuiz.attackerAnswer
    : !!activeQuiz.defenderAnswer;

  const category = activeQuiz.category || "KUNST & KULTUR";
  const questionText =
    activeQuiz.questionText ||
    "WELCHER DIESER WELTBERÜHMTEN KOMPONISTEN WURDE ZULETZT GEBOREN?";
  const options = activeQuiz.options || [
    { key: "A", text: "WOLFGANG AMADEUS MOZART" },
    { key: "B", text: "LUDWIG VAN BEETHOVEN" },
    { key: "C", text: "JOHANNES BRAHMS" },
    { key: "D", text: "ANTONIO VIVALDI" },
  ];

  useEffect(() => {
    if (timeLeft <= 0 || hasAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, hasAnswered]);

  const handleAnswerClick = (optionKey: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(optionKey);
    onSubmitAnswer(optionKey);
  };

  const attackerColorClass =
    COLOR_MAP[activeQuiz.attackerColor] || "fill-blue text-blue";
  const defenderColorClass =
    COLOR_MAP[activeQuiz.defenderColor] || "fill-yellow text-yellow";

  const radius = 20;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (timeLeft / TOTAL_TIME) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-primary border border-accent text-white rounded-4xl p-6 md:p-8 shadow-2xl">
        <div className="relative flex flex-col items-center text-center mt-2">
          <h2 className="text-4xl md:text-5xl tracking-wider text-white select-none font-lilita uppercase">
            QUIZDUELL
          </h2>

          <div className="flex items-center gap-4 mt-2">
            <LudoPieceSvg className={attackerColorClass} />
            <span className="text-neutral-400 font-bold text-xs tracking-widest font-sans">
              VS
            </span>
            <LudoPieceSvg className={defenderColorClass} />
          </div>

          <Badge className="mt-5 bg-[#736ced] hover:bg-[#736ced] text-white px-5 py-1 text-xs font-bold uppercase tracking-widest rounded-full border-none font-sans">
            {category}
          </Badge>
        </div>

        <div className="relative mt-6 bg-primary border border-accent rounded-3xl p-6 flex flex-col items-center">
          <div className="top-0 right-0 relative w-14 h-14 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 50 50"
            >
              <circle
                cx="25"
                cy="25"
                r={radius}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="25"
                cy="25"
                r={radius}
                stroke="var(--color-green)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute text-xl font-sans font-bold text-green">
              {timeLeft}s
            </span>
          </div>

          <p className="text-center font-bold text-lg md:text-xl px-4 my-10 leading-snug max-w-md tracking-wide text-white">
            {questionText}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2">
            {options.map((option) => {
              const isCurrentSelection = selectedAnswer === option.key;

              return (
                <Button
                  key={option.key}
                  disabled={hasAnswered}
                  onClick={() => handleAnswerClick(option.key)}
                  className={`h-16 flex items-center justify-start gap-4 px-5 rounded-xl text-left font-bold transition-all border-none shadow-sm font-sans
                    ${
                      isCurrentSelection
                        ? "bg-indigo-600 text-white"
                        : "bg-[#736ced] hover:bg-[#6159db] active:scale-[0.99] text-white"
                    } disabled:opacity-60 disabled:pointer-events-none`}
                >
                  <div className="flex items-center justify-center min-w-[28px] min-h-[28px] rounded-full bg-primary text-white text-xs font-extrabold shadow-inner">
                    {option.key}
                  </div>
                  <span className="text-xs md:text-sm tracking-wide truncate">
                    {option.text}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
