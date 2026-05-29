"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import translations, { Locale, locales, localeDir } from "@/lib/i18n/translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof translations.en;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: translations.en,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("tl_locale") as Locale | null;
    if (saved && locales.includes(saved)) setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("tl_locale", l);
    document.documentElement.dir = localeDir[l];
    document.documentElement.lang = l;
  }

  useEffect(() => {
    document.documentElement.dir = localeDir[locale];
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{
      locale,
      setLocale,
      t: translations[locale] as typeof translations.en,
      dir: localeDir[locale],
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
