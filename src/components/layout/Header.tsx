import { Settings, ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo.png";
import vector7 from "@/assets/vector7.png";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <div className="w-full px-4 pt-6 flex justify-center">
      <header className="w-full max-w-6xl h-22 rounded-[50px] border border-accent bg-primary shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex items-center justify-between px-8">
        <img
          src={logoImg}
          alt="LUDO 2.0"
          className="h-12 w-auto object-contain select-none"
        />

        <button
          onClick={logout}
          title="Abmelden"
          className="flex items-center gap-2 py-2 px-8 rounded-[40px] border font-lilita border-accent justify-center text-2xl text-white bg-transparent hover:bg-white/5 transition-colors"
        >
          <img src={vector7} alt="" className="w-5 h-5 object-contain" />
          {user?.username || "Spieler"}
          <ChevronDown size={20} />
        </button>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            aria-label="Einstellungen"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors"
          >
            <Settings size={24} className="text-white" />
          </button>
        </div>
      </header>
    </div>
  );
}
