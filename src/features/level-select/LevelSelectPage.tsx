import { useState } from 'react'
import { LevelAccordion } from './LevelAccordion'
import { LevelPreview } from './LevelPreview'

const mockLevels = [
  { id: 0, name: 'Level 0', description: 'Klassisches Ludo ohne Erweiterungen' },
  { id: 1, name: 'Level 1', description: 'Mit einer Erweiterung' },
  { id: 2, name: 'Level 2', description: 'Mit zwei Erweiterungen' },
  { id: 3, name: 'Level 3', description: 'Alle Erweiterungen aktiv' },
]

export function LevelSelectPage() {
  const [activeLevel, setActiveLevel] = useState(0)

  const activeLevelData = mockLevels.find(l => l.id === activeLevel) ?? mockLevels[0]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-white text-[64px] uppercase leading-none">
          Spiellevel
        </h1>
        <p className="text-white font-[family-name:var(--font-nav)] font-bold text-[30px] tracking-[2%] mt-2">
          Wähle das Level und fang an zu spielen
        </p>
      </div>

      <div className="flex gap-8">
        <div className="w-[492px] shrink-0 pt-32">
          <LevelAccordion
            levels={mockLevels}
            activeLevel={activeLevel}
            onLevelChange={setActiveLevel}
          />
        </div>
        <div className="flex-1">
          <LevelPreview level={activeLevelData} />
        </div>
      </div>
    </div>
  )
}
