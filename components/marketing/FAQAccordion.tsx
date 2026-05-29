"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export interface FAQ {
  q: string;
  a: string;
}

export function FAQAccordion({ items }: { items: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={`border transition-colors ${
              isOpen
                ? "border-[var(--sg-ink)] bg-[var(--sg-panel)]"
                : "sg-line bg-[var(--sg-bg)]"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3">
                <span className="sg-caption text-[var(--sg-text-mute)] text-[10px]">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm lg:text-base font-semibold text-[var(--sg-text)]">{item.q}</span>
              </span>
              <span className={`flex-shrink-0 h-7 w-7 grid place-items-center border ${
                isOpen
                  ? "border-[var(--sg-ink)] bg-[var(--sg-ink)] text-[var(--sg-bg)]"
                  : "sg-line text-[var(--sg-text-soft)]"
              }`}>
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-0 text-sm text-[var(--sg-text-soft)] leading-relaxed pl-14">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
