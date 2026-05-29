"use client";

import { Bell } from "lucide-react";
import { MobileSidebarToggle } from "./MobileSidebarToggle";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AppHeader({ title, subtitle, actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <MobileSidebarToggle />
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="hidden sm:block truncate text-[11px] font-medium text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {actions}

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]" />
        </button>

        {/* Avatar */}
        <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white shadow-md shadow-emerald-500/20">
          A
        </div>
      </div>
    </header>
  );
}
