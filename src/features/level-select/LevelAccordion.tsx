import { LevelItem } from "./LevelItem";

interface MockLevel {
  id: number;
  name: string;
  description: string;
}

interface LevelAccordionProps {
  levels: MockLevel[];
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
