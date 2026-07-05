import { LevelItem } from "./LevelItem";

interface Level {
  id: number;
  name: string;
  description: string;
  rules: string[];
}

interface LevelAccordionProps {
  levels: Level[];
  activeLevel: number;
  onLevelChange: (id: number) => void;
}

export function LevelAccordion({
  levels,
  activeLevel,
  onLevelChange,
}: LevelAccordionProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {levels.map((level) => (
        <LevelItem
          key={level.id}
          level={level}
          isActive={level.id === activeLevel}
          onSelect={onLevelChange}
        />
      ))}
    </div>
  );
}
