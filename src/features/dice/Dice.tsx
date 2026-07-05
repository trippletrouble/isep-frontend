import { useEffect, useState, useRef } from "react";

interface DiceProps {
  value: number;
  isRolling?: boolean;
}

// 1. Statische Map auslagern, um Garbage Collection zu entlasten
const DOT_POSITIONS: Record<number, number[]> = {
  0: [],
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Dice({ value, isRolling = false }: DiceProps) {
  const [displayedValue, setDisplayedValue] = useState<number>(value || 1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRolling) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setDisplayedValue(Math.floor(Math.random() * 6) + 1);
      }, 220);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setDisplayedValue(value || 1);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRolling, value]);

  useEffect(() => {
    if (!isRolling) {
      setDisplayedValue(value || 1);
    }
  }, [value, isRolling]);

  const renderDots = () => {
    const activeDots = DOT_POSITIONS[displayedValue] || [];

    return Array.from({ length: 9 }).map((_, index) => {
      const isVisible = activeDots.includes(index);
      return (
        <div
          key={index}
          className="flex justify-center items-center w-full h-full"
        >
          <div
            className={`w-2 h-2 md:w-5 md:h-5 bg-primary rounded-full shrink-0 aspect-square transform ${
              isRolling
                ? isVisible
                  ? "scale-100 opacity-100"
                  : "scale-0 opacity-0"
                : `transition-all duration-200 ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`
            }`}
          />
        </div>
      );
    });
  };

  return (
    <div className="relative">
      <style id="dice-animation-styles">{`
        @keyframes cleanFlat2DSpin {
          0% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-45deg) scale(0.95); }
          50% { transform: rotate(180deg) scale(1.1); }
          75% { transform: rotate(270deg) scale(1.02); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .animate-dice-roll-2d {
          animation: cleanFlat2DSpin 1000ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
        }
      `}</style>

      <div
        className={`w-14 md:w-30 h-14 md:h-30 bg-white rounded-2xl md:rounded-3xl p-4 grid grid-cols-3 grid-rows-3 gap-1 shrink-0 transition-all duration-300 will-change-transform ${
          isRolling
            ? "animate-dice-roll-2d border-2 border-white shadow-none"
            : "shadow-2xl border-2 border-transparent"
        }`}
        style={{
          transformOrigin: "center center",
          boxShadow:
            displayedValue > 0 && !isRolling
              ? "0 0 30px rgba(255, 255, 255, 0.2)"
              : "none",
        }}
      >
        {renderDots()}
      </div>
    </div>
  );
}
