import { Globe, Check, ChevronDown } from "lucide-react";
import {
  activateLocale,
  LOCALE_LABELS,
  useTranslation,
  type Locale,
} from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface LanguageSwitcherProps {
  variant?: "inline" | "dropdown";
}

export function LanguageSwitcher({
  variant = "inline",
}: LanguageSwitcherProps) {
  const { locale, t } = useTranslation();

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-xl text-white hover:bg-white/10 transition-all font-afacad outline-none focus:bg-white/10">
          <Globe size={16} />
          <span>{LOCALE_LABELS[locale]}</span>
          <ChevronDown size={14} className="opacity-70" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="min-w-44 bg-primary border border-accent text-white p-2"
        >
          <DropdownMenuLabel className="flex items-center gap-2 uppercase tracking-wider text-xs font-bold text-accent/80 px-1.5 py-1">
            <Globe size={14} />
            {t("Sprache")}
          </DropdownMenuLabel>

          {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(
            ([k, v]) => {
              const isSelected = locale === k;
              return (
                <DropdownMenuItem
                  key={k}
                  onSelect={() => activateLocale(k)}
                  className={`flex items-center justify-between font-afacad cursor-pointer px-1.5 py-2 rounded-md transition-colors ${
                    isSelected
                      ? "font-bold text-accent focus:bg-white/5 focus:text-accent"
                      : "text-white/80 focus:bg-white/10 focus:text-white"
                  }`}
                >
                  <span>{v}</span>
                  {isSelected && <Check size={16} className="shrink-0" />}
                </DropdownMenuItem>
              );
            },
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

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
              onSelect={() => activateLocale(k)}
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

