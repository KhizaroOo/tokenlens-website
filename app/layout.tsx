import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TokenLens — AI Usage Intelligence",
  description: "Track AI token usage, costs, and team productivity across Claude, OpenAI, GitHub Copilot, Cursor, and Microsoft Copilot — all in one dashboard.",
  keywords: ["AI", "Claude", "OpenAI", "GitHub Copilot", "Cursor", "Microsoft Copilot", "token", "cost", "analytics", "dashboard", "LLM spend"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
          storageKey="tl_theme"
        >
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
