import logoImg from "@/assets/logo.png";
import vector7 from "@/assets/vector7.png";
import { useAuth } from "@/hooks/useAuth";
import { SettingsDropdown } from "@/components/ui/SettingsDropdown";

export function Header() {
  const { user } = useAuth();

  return (
    <div className="w-full px-4 pt-6 flex justify-center">
      <header className="w-full max-w-6xl h-22 rounded-[50px] border border-accent bg-primary shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] flex items-center justify-between px-8">
        <img
          src={logoImg}
          alt="LUDO 2.0"
          className="h-12 w-auto object-contain select-none"
        />

        <div className="flex items-center gap-2 py-2 px-8 rounded-[40px] border font-lilita border-accent justify-center text-2xl text-white bg-transparent select-none">
          <img src={vector7} alt="" className="w-5 h-5 object-contain" />
          <span>{user?.username || "Spieler"}</span>
        </div>

        <div className="flex items-center gap-3">
          <SettingsDropdown />
        </div>
      </header>
    </div>
  );
}
