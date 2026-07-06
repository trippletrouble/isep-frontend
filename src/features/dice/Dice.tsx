import { useEffect, useState, useRef } from "react";

interface DiceProps {
  value: number;
  isSpinning?: boolean;
}

const DOT_POSITIONS: Record<number, number[]> = {
  0: [],
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Dice({ value, isSpinning = false }: DiceProps) {
  const [displayedValue, setDisplayedValue] = useState<number>(value || 1);
  const [isFinishingSpin, setIsFinishingSpin] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isSpinning && !isFinishingSpin && value > 0) {
      setDisplayedValue(value);
    }
  }, [value, isSpinning, isFinishingSpin]);

  useEffect(() => {
    if (isSpinning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setDisplayedValue(Math.floor(Math.random() * 6) + 1);
      }, 200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        if (value > 0) {
          setDisplayedValue(value);
        }

        setIsFinishingSpin(true);
        // A clean, snappy 500ms landing
        setTimeout(() => {
          setIsFinishingSpin(false);
        }, 500);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpinning, value]);

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
            className={`w-2 h-2 md:w-5 md:h-5 bg-primary rounded-full shrink-0 aspect-square transform transition-all duration-100 ${
              isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          />
        </div>
      );
    });
  };

  const isAnimating = isSpinning || isFinishingSpin;

  return (
    <div className="relative">
      <style id="dice-animation-styles">{`
        /* A balanced, energetic roll */
        @keyframes balancedRoll {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-10px) rotate(90deg) scale(1.05); }
          50% { transform: translateY(0) rotate(180deg) scale(1); }
          75% { transform: translateY(-10px) rotate(270deg) scale(1.05); }
          100% { transform: translateY(0) rotate(360deg) scale(1); }
        }
        
        /* A crisp, grounded landing with a realistic micro-bounce */
        @keyframes balancedLand {
          0% { transform: translateY(-10px) rotate(-15deg) scale(1.05); }
          50% { transform: translateY(2px) rotate(5deg) scale(0.95); }
          75% { transform: translateY(-2px) rotate(-2deg) scale(1.02); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }

        .animate-dice-roll {
          animation: balancedRoll 800ms linear infinite !important;
        }

        .animate-dice-landing {
          animation: balancedLand 500ms ease-out forwards !important;
        }
      `}</style>

      <div
        className={`w-14 md:w-30 h-14 md:h-30 bg-white rounded-2xl md:rounded-3xl p-4 grid grid-cols-3 grid-rows-3 gap-1 shrink-0 transition-all duration-300 will-change-transform ${
          isSpinning
            ? "animate-dice-roll border-2 border-white shadow-xl"
            : isFinishingSpin
              ? "animate-dice-landing border-2 border-white shadow-md"
              : "shadow-2xl border-2 border-transparent"
        }`}
        style={{
          transformOrigin: "center center",
          boxShadow:
            displayedValue > 0 && !isAnimating
              ? "0 0 30px rgba(255, 255, 255, 0.2)"
              : "none",
        }}
      >
        {renderDots()}
      </div>
    </div>
  );
}
