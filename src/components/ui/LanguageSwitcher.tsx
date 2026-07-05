import { Globe } from "lucide-react";
import { activateLocale, LOCALE_LABELS, useTranslation, type Locale } from "@/i18n";

export function LanguageSwitcher() {
  const { locale } = useTranslation();

  return (
    <div className="flex items-center gap-1.5">
      <Globe size={15} className="text-accent shrink-0" />
      <select
        value={locale}
        onChange={(e) => activateLocale(e.target.value as Locale)}
        className="bg-transparent text-accent text-sm font-afacad border-none outline-none cursor-pointer"
      >
        {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(([k, v]) => (
          <option key={k} value={k} className="bg-primary text-white">
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}
