import React, { createContext, useContext, useState, useEffect, type ReactNode, createElement } from "react";

export type Locale = "de" | "en" | "hi";

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  hi: "हिन्दी",
};

export const DEFAULT_LOCALE: Locale = "de";

type Messages = Record<string, string>;

const catalogs: Record<Locale, () => Promise<{ default: Messages }>> = {
  de: () => import("./locales/de.json"),
  en: () => import("./locales/en.json"),
  hi: () => import("./locales/hi.json"),
};

let activeLocale: Locale = DEFAULT_LOCALE;
let activeMessages: Messages = {};

export async function activateLocale(locale: Locale) {
  const mod = await catalogs[locale]();
  activeMessages = mod.default;
  activeLocale = locale;
  localStorage.setItem("locale", locale);
  listeners.forEach((fn) => fn());
}

const listeners = new Set<() => void>();

export function getLocale() { return activeLocale; }
export function translate(key: string): string {
  return activeMessages[key] ?? key;
}

// React context
interface I18nContext { locale: Locale; t: (key: string) => string; }
const Ctx = createContext<I18nContext>({ locale: DEFAULT_LOCALE, t: translate });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const fn = () => forceUpdate((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  return createElement(Ctx.Provider, { value: { locale: activeLocale, t: translate } }, children);
}

export function useTranslation() {
  return useContext(Ctx);
}

// Simple JSX component for translated strings
export function T({ k }: { k: string }): React.ReactNode {
  const { t } = useTranslation();
  return t(k);
}
