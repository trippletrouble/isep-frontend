import { Settings, ChevronDown, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import logoImg from '@/assets/logo.png'
import vector7 from '@/assets/vector7.png'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="w-full px-4 pt-6 flex justify-center">
      <header className="w-full max-w-6xl h-22 rounded-[50px] border border-accent bg-primary shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex items-center justify-between px-8">
        <img
          src={logoImg}
          alt="LUDO 2.0"
          className="h-12 w-auto object-contain select-none cursor-pointer"
          onClick={() => navigate('/')}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 py-2 px-8 rounded-[40px] border font-lilita border-accent justify-center text-2xl text-white bg-transparent hover:bg-white/5 transition-colors">
              <img src={vector7} alt="" className="w-5 h-5 object-contain" />
              {user?.username ?? 'Spieler'}
              <ChevronDown size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="bg-primary border-accent text-white min-w-[180px]">
            {user && (
              <DropdownMenuItem
                className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                onClick={() => navigate(`/profile/${user.userId}`)}
              >
                <User size={16} className="mr-2" />
                Mein Profil
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-accent" />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-white/10 focus:bg-white/10 text-red-400"
              onClick={logout}
            >
              <LogOut size={16} className="mr-2" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          aria-label="Einstellungen"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors"
        >
          <Settings size={24} className="text-white" />
        </button>
      </header>
    </div>
  )
}
