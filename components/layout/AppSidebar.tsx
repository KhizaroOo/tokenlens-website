"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, UsersRound, Cpu,
  Bell, FileBarChart, Settings, Zap, LogOut,
  DollarSign, Code2, Building2,
  Terminal, Bot, Crosshair, BrainCircuit,
  ChevronDown, TrendingUp, Lightbulb,
  ClipboardList, BellRing, AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

interface Me { name: string; email: string; role: string }

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  comingSoon?: boolean;
  limited?: boolean;
}

interface NavGroup {
  key: string;
  label: string;
  defaultOpen?: boolean;
  items: NavItem[];
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [me, setMe] = useState<Me | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["overview"]));

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.ok ? r.json() : null;
      })
      .then(d => { if (d?.user) setMe(d.user); })
      .catch(() => null);
  }, [router]);

  const navGroups: NavGroup[] = [
    {
      key: "overview",
      label: "Overview",
      defaultOpen: true,
      items: [
        { label: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      key: "intelligence",
      label: "Intelligence",
      items: [
        { label: "AI ROI",      href: "/roi",         icon: TrendingUp, comingSoon: true },
        { label: "Suggestions", href: "/suggestions",  icon: Lightbulb,  comingSoon: true },
        { label: t.nav.users,   href: "/ai-users",     icon: Users },
        { label: t.nav.teams,   href: "/ai-teams",     icon: UsersRound },
        { label: t.nav.models,  href: "/ai-models",    icon: Cpu },
      ],
    },
    {
      key: "developer-ai",
      label: "Developer AI Tools",
      items: [
        { label: "Overview",        href: "/developer-ai-tools",                  icon: Code2 },
        { label: "Claude Code",     href: "/developer-ai-tools/claude-code",      icon: Terminal },
        { label: "GitHub Copilot",  href: "/developer-ai-tools/github-copilot",   icon: Bot },
        { label: "Cursor",          href: "/developer-ai-tools/cursor",           icon: Crosshair },
      ],
    },
    {
      key: "llm-spend",
      label: "LLM/API Spend Providers",
      items: [
        { label: "Overview",    href: "/llm-spend",        icon: DollarSign },
        { label: "Claude",      href: "/llm-spend/claude", icon: Zap },
        { label: "OpenAI",      href: "/llm-spend/openai", icon: BrainCircuit },
        { label: "Gemini",      href: "/limitations",      icon: AlertOctagon, limited: true },
        { label: "Perplexity",  href: "/limitations",      icon: AlertOctagon, limited: true },
      ],
    },
    {
      key: "business-ai",
      label: "Business Productivity AI",
      items: [
        { label: "Overview",          href: "/business-productivity-ai",                          icon: Building2 },
        { label: "Microsoft Copilot", href: "/business-productivity-ai/microsoft-copilot",        icon: Building2 },
      ],
    },
    {
      key: "governance",
      label: "Governance",
      items: [
        { label: t.nav.alerts,      href: "/alerts",        icon: Bell,          comingSoon: true },
        { label: t.nav.reports,     href: "/reports",       icon: FileBarChart,  comingSoon: true },
        { label: "Audit Logs",      href: "/audit-logs",    icon: ClipboardList, comingSoon: true },
        { label: "Notifications",   href: "/notifications", icon: BellRing,      comingSoon: true },
        { label: "Provider Limits", href: "/limitations",   icon: AlertOctagon },
        { label: t.nav.settings,    href: "/settings",      icon: Settings },
      ],
    },
  ];

  // Auto-open the group that contains the current active route
  useEffect(() => {
    const activeGroup = navGroups.find(g =>
      g.items.some(item => !item.limited && (pathname === item.href || pathname.startsWith(item.href + "/")))
    );
    if (activeGroup) {
      setOpenGroups(prev => new Set([...prev, activeGroup.key]));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleGroup(key: string) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function isActive(href: string, limited?: boolean) {
    if (limited) return false; // limited items (Gemini, Perplexity) never show as active
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) {
      // Only active if no more-specific sibling nav item also matches the current path
      const allItems = navGroups.flatMap(g => g.items);
      const moreSpecificMatch = allItems.some(
        item =>
          item.href !== href &&
          item.href.startsWith(href) &&
          (pathname === item.href || pathname.startsWith(item.href + "/"))
      );
      return !moreSpecificMatch;
    }
    return false;
  }

  function isGroupHasActive(group: NavGroup) {
    return group.items.some(item => isActive(item.href, item.limited));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 flex-col bg-[#050810] border-r border-white/[0.04]">

      {/* ── Logo ── */}
      <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-white/[0.04] px-5">
        <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30">
          <Zap className="h-4 w-4 text-white drop-shadow-sm" />
          <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-30 blur-md" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-extrabold tracking-tight text-white">
            Token<span className="gradient-text">Lens</span>
          </p>
          <p className="text-[9px] font-semibold tracking-[0.15em] text-white/20 uppercase">
            AI Intelligence
          </p>
        </div>
      </div>

      {/* ── Tagline ── */}
      <div className="px-5 py-2 border-b border-white/[0.04]">
        <p className="text-[10px] text-white/30 leading-relaxed">
          Track token usage, costs &amp; productivity across all your AI tools.
        </p>
      </div>

      {/* ── Accordion Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {navGroups.map((group) => {
          const isOpen = openGroups.has(group.key);
          const hasActive = isGroupHasActive(group);

          return (
            <div key={group.key} className="px-2 mb-0.5">

              {/* Group Header — clickable accordion toggle */}
              <button
                onClick={() => toggleGroup(group.key)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group",
                  hasActive
                    ? "text-white/90"
                    : "text-white/45 hover:text-white/70",
                  isOpen ? "bg-white/[0.03]" : "hover:bg-white/[0.03]"
                )}
              >
                <span className={cn(
                  "text-[10px] font-bold tracking-[0.12em] uppercase select-none",
                  hasActive ? "text-emerald-400/80" : ""
                )}>
                  {group.label}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 flex-shrink-0 transition-transform duration-200",
                    isOpen ? "rotate-180" : "",
                    hasActive ? "text-emerald-400/60" : "text-white/30"
                  )}
                />
              </button>

              {/* Group Items — animated expand/collapse */}
              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <ul className="overflow-hidden space-y-0.5 pt-0.5 pb-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href, item.limited);

                    /* ── Limited item ── */
                    if (item.limited) {
                      return (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            title="No admin API available — see Provider Limitations"
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 opacity-40 hover:opacity-60 transition-opacity duration-150"
                          >
                            <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-white/30" />
                            <span className="flex-1 text-xs font-medium text-white/30 truncate">{item.label}</span>
                            <span className="flex-shrink-0 rounded px-1 py-0.5 text-[8px] font-bold tracking-wide bg-amber-500/20 text-amber-400/80 leading-none">
                              LIMITED
                            </span>
                          </Link>
                        </li>
                      );
                    }

                    /* ── Coming Soon item ── */
                    if (item.comingSoon) {
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-white/35 hover:text-white/50 hover:bg-white/[0.03] transition-all duration-150"
                          >
                            <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-white/25" />
                            <span className="flex-1 text-xs font-medium truncate">{item.label}</span>
                            <span className="flex-shrink-0 rounded px-1 py-0.5 text-[8px] font-bold tracking-wide bg-amber-500/15 text-amber-400/60 leading-none">
                              SOON
                            </span>
                          </Link>
                        </li>
                      );
                    }

                    /* ── Active item ── */
                    if (active) {
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-white transition-all duration-150"
                          >
                            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20" />
                            <item.icon className="relative z-10 h-3.5 w-3.5 flex-shrink-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                            <span className="relative z-10 flex-1 text-xs font-semibold truncate">{item.label}</span>
                            <span className="relative z-10 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                          </Link>
                        </li>
                      );
                    }

                    /* ── Regular item ── */
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-150"
                        >
                          <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-white/40 group-hover:text-white/80 transition-colors" />
                          <span className="flex-1 text-xs font-medium truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

            </div>
          );
        })}
      </nav>

      {/* ── User Profile ── */}
      <div className="flex-shrink-0 border-t border-white/[0.04] p-3">
        <div className="group flex items-center gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-white/[0.04] cursor-default">
          <div className="relative flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white">
              {me?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#050810] shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{me?.name ?? "…"}</p>
            <p className="text-[10px] text-white/50 truncate">{me?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex-shrink-0 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all text-white/25 hover:text-red-400 hover:bg-red-400/10"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 px-2 text-[9px] font-semibold tracking-wider text-white/15 uppercase">
          v3.1.0 · Production
        </p>
      </div>

    </aside>
  );
}
