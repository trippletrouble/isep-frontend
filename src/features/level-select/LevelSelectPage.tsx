import { useState } from "react";
import { LevelAccordion } from "./LevelAccordion";
import { LevelPreview } from "./LevelPreview";
import { useTranslation } from "@/i18n";

interface LevelConfig {
  id: number;
  name: string;
  description: string;
  rules: string[];
}

const LEVELS: LevelConfig[] = [
  {
    id: 0,
    name: "Level 0",
    description: "Klassisches Ludo'",
    rules: ["THROW_AGAIN_ON_6"],
  },
  {
    id: 1,
    name: "Level 1",
    description: "Erweiterung: Mit Quiz-Duell oder Pestfliegen",
    rules: ["THROW_AGAIN_ON_6", "QUIZ_DUELL"],
  },
  {
    id: 2,
    name: "Level 2",
    description: "Erweiterung: Mit Quiz-Duell und Pestfliegen",
    rules: ["THROW_AGAIN_ON_6", "QUIZ_DUELL", "THREE_SIXES_LOSE_TURN"],
  },
  {
    id: 3,
    name: "Level 3",
    description: "Alle aktiven Erweiterungen (Quiz-Duell & Sechser-Regeln)",
    rules: ["THROW_AGAIN_ON_6", "QUIZ_DUELL", "THREE_SIXES_LOSE_TURN"],
  },
];

export function LevelSelectPage() {
  const [activeLevel, setActiveLevel] = useState(0);
  const { t } = useTranslation();

  const activeLevelData = LEVELS.find((l) => l.id === activeLevel) ?? LEVELS[0];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-white text-[40px] md:text-[64px] uppercase leading-none">
          {t("Spiellevel")}
        </h1>
        <p className="text-white font-bold text-[20px] md:text-[30px] tracking-[2%] mt-2">
          {t("Wähle das Level und fang an zu spielen")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-stretch w-full">
        <div className="w-full flex-1 order-2 md:order-1">
          <LevelAccordion
            levels={LEVELS}
            activeLevel={activeLevel}
            onLevelChange={setActiveLevel}
          />
        </div>
        <div className="w-full flex-1 order-1 md:order-2">
          <LevelPreview level={activeLevelData} />
        </div>
      </div>
    </div>
  );
}
