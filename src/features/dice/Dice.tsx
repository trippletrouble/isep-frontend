interface DiceProps {
  value: number;
}

export function Dice({ value }: DiceProps) {
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

    return Array.from({ length: 9 }).map((_, index) => (
      <div key={index} className="flex justify-center items-center">
        {activeDots.includes(index) && (
          <div className="w-5 h-5 bg-primary rounded-full" />
        )}
      </div>
    ));
  };

  return (
    <div
      className="w-32 h-32 bg-white rounded-3xl p-4 mb-10 grid grid-cols-3 grid-rows-3 gap-1 shadow-2xl"
      style={{ boxShadow: "0 0 40px rgba(255, 255, 255, 0.25)" }}
    >
      {renderDots()}
    </div>
  );
}
