import { Settings, LogOut } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SettingsDropdown() {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={t("Einstellungen")}
          className="group flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors focus:outline-none text-white cursor-pointer"
        >
          <Settings
            size={24}
            className="transition-transform duration-300 ease-out group-data-[state=open]:rotate-45"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 max-w-[calc(100vw-2rem)] bg-primary text-white rounded-3xl p-3 z-50 animate-in fade-in-50 zoom-in-95 duration-100 border border-accent shadow-[0px_16px_22.2px_rgba(0,0,0,0.25)] ring-0"
      >
        <DropdownMenuLabel className="font-lilita text-xl tracking-wide px-2 pt-1 pb-2 text-white text-center sm:text-left">
          {t("Einstellungen")}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-accent/30 mx-1 mb-3" />

        <LanguageSwitcher />

        <DropdownMenuSeparator className="bg-accent/30 mx-1 mb-2" />

        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2.5 text-base font-lilita rounded-xl cursor-pointer bg-red hover:bg-red/20 text-primary focus:bg-red/20 focus:text-red-400 transition-colors"
        >
          <LogOut size={16} className="shrink-0" />
          <span>{t("Abmelden")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
