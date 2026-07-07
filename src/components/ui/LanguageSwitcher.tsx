import { Globe, Check } from "lucide-react";
import {
  activateLocale,
  LOCALE_LABELS,
  useTranslation,
  type Locale,
} from "@/i18n";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { locale, t } = useTranslation();

  return (
    <>
      <div className="flex items-center gap-2 px-2 mb-2 text-accent/80 font-afacad text-xs uppercase tracking-wider font-bold">
        <Globe size={14} />
        <span>{t("Sprache")}</span>
      </div>

      <div className="flex flex-col gap-1 mb-3">
        {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(([k, v]) => {
          const isSelected = locale === k;
          return (
            <DropdownMenuItem
              key={k}
              onClick={() => activateLocale(k)}
              className={`flex items-center justify-between px-3 py-2.5 text-base font-afacad rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-accent text-primary font-bold shadow-[0_2px_8px_rgba(var(--accent),0.2)] focus:bg-accent focus:text-primary"
                  : "hover:bg-white/10 focus:bg-white/10 text-white"
              }`}
            >
              <span>{v}</span>
              {isSelected && <Check size={16} className="shrink-0 stroke-3" />}
            </DropdownMenuItem>
          );
        })}
      </div>
    </>
  );
}
