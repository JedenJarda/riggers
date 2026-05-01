"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = {
  en: "EN",
  de: "DE",
  cs: "CZ",
};

export function LanguageSwitcher() {
  const current = useLocale();
  const pathname = usePathname();

  const stripLocale = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    if (segments[0] && routing.locales.includes(segments[0] as "en" | "de" | "cs")) {
      segments.shift();
    }
    return "/" + segments.join("/");
  };

  const basePath = stripLocale(pathname);

  return (
    <nav
      aria-label="Language"
      className="flex items-center gap-2 text-xs tracking-[0.18em] uppercase"
    >
      {routing.locales
        .filter((loc) => loc !== "cs")
        .map((loc, i, visible) => {
          const isActive = loc === current;
          const href = loc === routing.defaultLocale ? basePath : `/${loc}${basePath === "/" ? "" : basePath}`;
          return (
            <span key={loc} className="flex items-center gap-2">
              <Link
                href={href}
                className={
                  isActive
                    ? "text-neon-300 [text-shadow:0_0_8px_var(--color-neon-500)]"
                    : "text-mist/60 hover:text-cream transition-colors"
                }
              >
                {LABELS[loc]}
              </Link>
              {i < visible.length - 1 && (
                <span aria-hidden className="text-mist/30">·</span>
              )}
            </span>
          );
        })}
    </nav>
  );
}
