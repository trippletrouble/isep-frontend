interface DiceButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function DiceButton({ onClick, disabled }: DiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-white text-primary font-lilita text-2xl uppercase py-4 px-6 rounded-full hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      WÜRFEL WERFEN
    </button>
  );
}
