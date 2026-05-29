"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { locales, type Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
      >
        {locale.toUpperCase()}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-24 rounded-xl border border-border bg-popover p-1 shadow-xl shadow-black/20">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l as Locale); setOpen(false); }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                locale === l
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {l.toUpperCase()}
              {locale === l && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
