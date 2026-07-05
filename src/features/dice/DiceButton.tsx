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
      className={`w-[262px] h-[53px] bg-[#FFFDFD] border border-[#797979] rounded-[20px] font-lilita text-[28px] text-[#292929] uppercase flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
        shouldPulse
          ? "animate-pulse scale-[1.03] shadow-[0px_4px_22.2px_rgba(0,0,0,0.4)]"
          : "shadow-[0px_4px_22.2px_rgba(0,0,0,0.25)] hover:bg-white/90"
      }`}
    >
      WÜRFEL WERFEN
    </button>
  );
}
