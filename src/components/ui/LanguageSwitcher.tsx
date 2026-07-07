import { Globe, Check, ChevronDown } from "lucide-react";
import { activateLocale, LOCALE_LABELS, useTranslation, type Locale } from "@/i18n";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
    const { locale, t } = useTranslation();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-xl text-white hover:bg-white/10 transition-all font-afacad">
                <Globe size={16} />
                <span>{LOCALE_LABELS[locale]}</span>
                <ChevronDown size={14} className="opacity-70" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuLabel className="flex items-center gap-2 uppercase tracking-wider">
                    <Globe size={14} />
                    {t("Sprache")}
                </DropdownMenuLabel>

                {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(([k, v]) => {
                    const isSelected = locale === k;
                    return (
                        <DropdownMenuItem
                            key={k}
                            onSelect={() => activateLocale(k)}
                            className={`flex items-center justify-between font-afacad cursor-pointer ${
                                isSelected ? "font-bold text-accent" : ""
                            }`}
                        >
                            <span>{v}</span>
                            {isSelected && <Check size={16} className="shrink-0" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}