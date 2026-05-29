"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Menu, X, ArrowUpRight, Sun, Moon } from "lucide-react";
import { LensGlyph } from "./gallery";

const NAV = [
  { label: "Product",      href: "/platform" },
  { label: "Solutions",    href: "/solutions" },
  { label: "Use Cases",    href: "/use-cases" },
  { label: "Integrations", href: "/integrations" },
  { label: "Pricing",      href: "/pricing" },
  { label: "Resources",    href: "/resources" },
  { label: "Security",     href: "/security" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- standard hydration-safe mount flag for theme toggle
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="h-8 w-8" aria-hidden />;
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="h-9 w-9 grid place-items-center border sg-line text-[var(--sg-text)] hover:border-[var(--sg-ink)]/40 transition-colors"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const pathname                = usePathname() ?? "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close mobile menu on navigation; pathname is the external system here
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--sg-bg)]/85 backdrop-blur-xl border-b sg-line"
          : "bg-transparent"
      }`}
    >
      {/* Top operating-layer status strip (museum gallery feel) */}
      <div className="hidden md:flex items-center justify-between mx-auto max-w-7xl px-5 lg:px-10 pt-2 pb-1 text-[10px] tracking-widest">
        <div className="flex items-center gap-3 text-[var(--sg-text-mute)] sg-eyebrow">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--sg-signal)] animate-pulse" />
          AI OPERATING LAYER · TOKENLENS
          <span className="opacity-60">· EXHIBIT IN ROTATION</span>
        </div>
        <div className="flex items-center gap-3 text-[var(--sg-text-mute)] sg-caption">
          <span>LENS v2.1</span>
          <span className="opacity-40">/</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-10 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <LensGlyph size={26} className="transition-transform group-hover:rotate-180 duration-700" />
          <span className="text-base font-black tracking-tight text-[var(--sg-text)] sg-display">
            TokenLens
          </span>
        </Link>

        {/* Desktop nav — pill row */}
        <nav className="hidden lg:flex items-center gap-1 border sg-line rounded-full px-1 py-0.5 bg-[var(--sg-panel)]/40 backdrop-blur-sm">
          {NAV.map(item => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-1 text-[13px] rounded-full transition-colors ${
                  active
                    ? "bg-[var(--sg-ink)] text-[var(--sg-bg)] font-semibold"
                    : "text-[var(--sg-text-soft)] hover:text-[var(--sg-text)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeSwitch />
          <Link
            href="/login"
            className="text-sm text-[var(--sg-text-soft)] hover:text-[var(--sg-text)] px-3 py-1.5 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/demo"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-[var(--sg-ink)] text-[var(--sg-bg)] hover:bg-[var(--sg-signal)] hover:text-[#050505] transition-colors"
          >
            Book Demo
            <ArrowUpRight className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
          </Link>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeSwitch />
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
            className="h-9 w-9 grid place-items-center border sg-line text-[var(--sg-text)]"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="lg:hidden bg-[var(--sg-bg)] border-t sg-line">
          <nav className="px-5 py-5 flex flex-col gap-1">
            {NAV.map(item => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between px-3 py-3 border-b sg-line-soft transition-colors ${
                    active
                      ? "text-[var(--sg-signal)] font-bold"
                      : "text-[var(--sg-text)]"
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
                </Link>
              );
            })}
            <Link
              href="/login"
              className="mt-4 px-3 py-3 border sg-line text-sm text-[var(--sg-text)] text-center"
            >
              Login
            </Link>
            <Link
              href="/demo"
              className="mt-2 px-3 py-3 bg-[var(--sg-ink)] text-[var(--sg-bg)] text-sm font-semibold text-center"
            >
              Book Demo →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
