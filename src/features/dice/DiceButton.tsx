interface DiceButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function DiceButton({ onClick, disabled }: DiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-white text-primary font-lilita text-xs sm:text-base lg:text-2xl uppercase py-2 sm:py-3 lg:py-4 px-2 lg:px-6 rounded-full hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      WÜRFEL WERFEN
    </button>
  );
}
