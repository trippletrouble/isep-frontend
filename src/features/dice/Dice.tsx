interface DiceProps {
  value: number;
  isRolling?: boolean;
}

export function Dice({ value, isRolling = false }: DiceProps) {
  const renderDots = () => {
    const dotPositions: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const activeDots = dotPositions[value] || [4];

    return Array.from({ length: 9 }).map((_, index) => {
      const isVisible = activeDots.includes(index);
      return (
        <div key={index} className="flex justify-center items-center">
          <div
            className={`w-2.5 h-2.5 md:w-4.5 md:h-4.5 bg-primary rounded-full shrink-0 aspect-square transition-all duration-150 transform ${
              isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          />
        </div>
      );
    });
  };

  return (
    <>
      <style>{`
        @keyframes cleanFlat2DSpin {
          0% { 
            transform: rotate(0deg) scale(1); 
          }
          20% { 
            transform: rotate(-45deg) scale(0.9); 
          }
          50% { 
            transform: rotate(180deg) scale(1.15); 
          }
          75% { 
            transform: rotate(270deg) scale(1.05);
          }
          100% { 
            transform: rotate(360deg) scale(1);
          }
        }
        .animate-dice-roll-2d {
          animation: cleanFlat2DSpin 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div
        className={`w-14 h-14 md:w-24 md:h-24 bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 grid grid-cols-3 grid-rows-3 gap-1 shrink-0 transition-shadow duration-3xl ${
          isRolling
            ? "animate-dice-roll-2d border-2 border-white shadow-none"
            : "shadow-[0_0_40px_rgba(255,255,255,0.25)] border-2 border-transparent"
        }`}
        style={{
          transformOrigin: "center center",
        }}
      >
        {renderDots()}
      </div>
    </>
  );
}
