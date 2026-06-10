import boardImg from '@/assets/board.png'

interface MockLevel {
  id: number
  name: string
  description: string
}

interface LevelPreviewProps {
  level: MockLevel
}

export function LevelPreview({ level }: LevelPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <img
        src={boardImg}
        alt="Ludo board preview"
        className="w-full max-w-[500px] object-contain select-none"
      />
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-white text-[64px] uppercase leading-none mb-3">
          {level.name.toUpperCase()}
        </h2>
        <p className="text-white font-[family-name:var(--font-nav)] font-bold text-[20px]">{level.description}</p>
      </div>
    </div>
  )
}
