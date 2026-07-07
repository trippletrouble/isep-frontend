import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ScrollText } from "lucide-react";
import { RulesDialog } from "./RulesDialog";
import { useTranslation } from "@/i18n";

interface Level {
  id: number;
  name: string;
  description: string;
  rules: string[];
}

interface LevelItemProps {
  level: Level;
  isActive: boolean;
  onSelect: (id: number) => void;
}

export function LevelItem({ level, isActive, onSelect }: LevelItemProps) {
  const navigate = useNavigate();
  const itemRef = useRef<HTMLDivElement>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isActive]);

  return (
    <div ref={itemRef} className="w-full flex flex-col transition-all duration-300">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(level.id)}
        onKeyDown={(e) => e.key === "Enter" && onSelect(level.id)}
        className={`w-full rounded-[10px] border cursor-pointer transition-all duration-300 transform ${
          isActive
            ? "bg-white border-white text-primary shadow-[0px_8px_22.2px_rgba(255,255,255,0.25)] scale-[1.01]"
            : "bg-primary border-accent text-white hover:border-white/50 shadow-[0px_4px_22.2px_rgba(0,0,0,0.25)] hover:scale-[1.005]"
        }`}
      >
        <div className="px-[35px] h-[71px] flex items-center">
          <h3 className="text-[36px] leading-none m-0">{level.name}</h3>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isActive ? "grid-rows-[1fr] opacity-100 pt-4" : "grid-rows-[0fr] opacity-0 pt-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 px-0">
            <button
              onClick={() =>
                navigate(`/lobby/level-${level.id}`, {
                  state: { rules: level.rules },
                })
              }
              className="flex-1 h-[60px] bg-green text-black hover:opacity-90 font-bold text-[32px] tracking-[2%] rounded-[10px] flex items-center justify-center gap-2 transition-opacity"
            >
              {t("Spielen")} <ChevronRight size={24} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setRulesOpen(true)}
              className="flex-1 h-[60px] bg-yellow text-black hover:opacity-90 font-bold text-[32px] tracking-[2%] rounded-[10px] flex items-center justify-center gap-2 transition-opacity"
            >
              {t("Regeln")} <ScrollText size={22} />
            </button>
            <RulesDialog
              levelId={level.id}
              open={rulesOpen}
              onOpenChange={setRulesOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
