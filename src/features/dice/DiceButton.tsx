interface DiceButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function DiceButton({ onClick, disabled }: DiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-white text-primary font-lilita text-xs md:text-xl uppercase py-2 md:py-4 px-1 md:px-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed whitespace-normal lg:whitespace-nowrap shrink-0"
    >
      WÜRFEL WERFEN
    </button>
  );
}
