interface DiceButtonProps {
  onClick: () => void;
  disabled?: boolean;
  shouldPulse?: boolean;
}

export function DiceButton({
  onClick,
  disabled,
  shouldPulse,
}: DiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full font-lilita text-xs sm:text-base uppercase py-2 sm:py-3 lg:py-4 px-2 lg:px-6 rounded-[20px] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
        shouldPulse
          ? "bg-white text-primary animate-pulse scale-[1.03] shadow-[0_0_20px_rgba(255,255,255,0.6)] hover:bg-white"
          : "bg-white text-primary hover:bg-gray-100"
      }`}
    >
      WÜRFEL WERFEN
    </button>
  );
}
