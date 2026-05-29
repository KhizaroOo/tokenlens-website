"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-8 w-[52px] items-center rounded-full border border-border bg-secondary p-0.5 transition-all hover:border-primary/40 hover:bg-secondary/80"
      aria-label="Toggle theme"
    >
      {/* Track */}
      <span
        className={`absolute flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
          isDark
            ? "translate-x-[22px] bg-[#1a2540]"
            : "translate-x-0 bg-white"
        }`}
      >
        {isDark
          ? <Moon  className="h-3 w-3 text-cyan-400" />
          : <Sun   className="h-3 w-3 text-amber-500" />}
      </span>
      {/* Icons track */}
      <Sun  className={`ml-1 h-3 w-3 transition-opacity ${isDark ? "opacity-20 text-slate-500" : "opacity-0"}`} />
      <Moon className={`ml-auto mr-1 h-3 w-3 transition-opacity ${isDark ? "opacity-0" : "opacity-20 text-slate-400"}`} />
    </button>
  );
}
