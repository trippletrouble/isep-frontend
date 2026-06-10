import { Settings, ChevronDown } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import vector7 from '@/assets/vector7.png'

export function Header() {
  return (
    <div className="w-full px-4 pt-6 flex justify-center">
      <header className="w-full max-w-[1172px] h-[100px] rounded-[50px] border border-[#797979] bg-[#282828] shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex items-center justify-between px-8">
        <img src={logoImg} alt="LUDO 2.0" className="h-12 w-auto object-contain select-none" />

        <button
          className="flex items-center gap-2 w-[196px] h-[55px] rounded-[40px] border border-[#797979] justify-center font-[family-name:var(--font-heading)] text-2xl text-white bg-transparent hover:bg-white/5 transition-colors"
        >
          <img src={vector7} alt="" className="w-5 h-5 object-contain" />
          {/* Week 2: show real username from useAuthStore() */}
          Spieler
          <ChevronDown size={20} />
        </button>

        <button
          aria-label="Einstellungen"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors"
        >
          <Settings size={24} className="text-[#ACACAC]" />
        </button>
      </header>
    </div>
  )
}
