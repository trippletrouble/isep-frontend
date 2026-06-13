import boardImg from "@/assets/board.png";

interface MockLevel {
  id: number;
  name: string;
  description: string;
}

interface LevelPreviewProps {
  level: MockLevel;
}

export function LevelPreview({ level }: LevelPreviewProps) {
  return (
    <div className="w-full h-full relative flex flex-col items-end justify-end min-h-0 overflow-hidden">
      <div className="absolute inset-0 z-10 pointer-events-none">
        <img
          src={boardImg}
          alt="Ludo board preview"
          className="w-full h-auto object-cover object-top select-none"
        />
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none bg-linear-to-t from-primary from-15% via-primary/80 via-50% to-transparent" />

      <div className="relative z-30 text-white flex flex-col items-end text-right px-4 pb-4 md:px-12 md:pb-8 pointer-events-none w-full">
        <h2 className="text-5xl md:text-7xl uppercase leading-none mb-3 tracking-tight drop-shadow-md">
          {level.name.toUpperCase()}
        </h2>
        <p className="text-base md:text-xl leading-relaxed drop-shadow-md">
          {level.description}
        </p>
      </div>
    </div>
  );
}
