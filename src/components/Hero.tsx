"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { EuropeMap } from "./EuropeMap";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import type { CountryPath, GlobeShape, ProjectedCity, Route } from "@/lib/europe-geo";

type Props = {
  countries: CountryPath[];
  cities: ProjectedCity[];
  routes: Route[];
  globe: GlobeShape;
  viewX: number;
  viewY: number;
  viewW: number;
  viewH: number;
};

// Timing constant for Hero entry animations (headline/subhead/CTA/
// footer-meta/scroll). Kept at 1.3 so the text column stays in the
// same tempo band as the (locked) logo flicker.
const SLOW = 1.3;

export function Hero({ countries, cities, routes, globe, viewX, viewY, viewW, viewH }: Props) {
  const t = useTranslations("Hero");
  // Single signal gating every hero animation. Flips to true right after
  // mount so the logo flicker (and everything that keys off it) starts
  // on page load — no audio, no user gesture required.
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(true);
  }, []);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink-950">
      {/* Map layer — full bleed. Prague's on-screen position is
          controlled by GLOBE_CX inside europe-geo.ts, so no transform is
          needed here. */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_60%_45%,#0d1230_0%,#070a1c_55%,#04050a_90%)]">
        <div className="absolute inset-0">
          <EuropeMap
            countries={countries}
            cities={cities}
            routes={routes}
            globe={globe}
            viewX={viewX}
            viewY={viewY}
            viewW={viewW}
            viewH={viewH}
            active={started}
          />
        </div>
        {/* Left-side scrim — keeps headline readable over the map */}
        <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-ink-950 via-ink-950/80 to-transparent" />
      </div>

      {/* Top bar — language switcher only; logo lives lower, aligned
          with the headline column. */}
      <div className="absolute inset-x-0 top-0 z-30">
        <div className="flex justify-end px-6 py-7 md:px-12 lg:px-20">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Neon logo — flickers on once `started`. Sits between the top of
          the page and the headline, left-aligned with the "Your" of the H1. */}
      <div className="absolute inset-x-0 top-[13%] z-30">
        <div className="px-6 md:px-12 lg:px-20">
          <Logo width={280} started={started} />
        </div>
      </div>

      {/* Eyebrow / headline / subhead / CTA — anchored left within the 1140 frame */}
      <div className="relative z-20 flex min-h-[100svh] flex-col justify-center px-6 md:px-12 lg:px-20">
        <div className="mt-10 max-w-xl md:max-w-2xl">
          {/* Eyebrow: small tracker tagline with a purple dash */}
          <motion.div
            className="mb-7 flex items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6 * SLOW, delay: 0.15 * SLOW, ease: "easeOut" }}
          >
            <span className="h-px w-12 bg-neon-400" />
            <span className="text-xs font-medium uppercase tracking-[0.32em] text-neon-300">
              {t("eyebrow")}
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-tight text-cream"
            initial={{ opacity: 0, y: 24 }}
            animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7 * SLOW, delay: 0.3 * SLOW, ease: "easeOut" }}
          >
            <span className="block">{t("headlineMain")}</span>
            <span className="block text-neon-300">
              {t("headlineAccent")}
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-base sm:text-lg md:text-xl text-mist/80 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.7 * SLOW, delay: 0.5 * SLOW, ease: "easeOut" }}
          >
            {t("subhead")}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.6 * SLOW, delay: 0.7 * SLOW, ease: "easeOut" }}
          >
            <a
              href="#book"
              className="group relative inline-flex items-center gap-3 border border-neon-400/70 px-7 py-3.5 text-sm md:text-base font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-neon-300 hover:bg-neon-500/10 hover:[box-shadow:var(--shadow-neon-md)] focus:outline-none focus-visible:[box-shadow:var(--shadow-neon-md)]"
            >
              {t("cta")}
              <span
                aria-hidden
                className="text-neon-300 transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
            <a
              href="#crew"
              className="group inline-flex items-center gap-2 text-sm tracking-wide text-mist/70 transition-colors duration-200 hover:text-cream"
            >
              <span className="border-b border-mist/30 pb-0.5 group-hover:border-mist/70">
                {t("ctaSecondary")}
              </span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Footer meta — credentials left, tagline right */}
      <motion.div
        className="absolute inset-x-0 bottom-5 z-20 flex justify-between px-6 md:px-12 lg:px-20 text-[10px] uppercase tracking-[0.3em] text-mist/55"
        initial={{ opacity: 0 }}
        animate={started ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 * SLOW, delay: 1.1 * SLOW }}
      >
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-400 shadow-[0_0_8px_#b829e8]" />
          <span>{t("credentials")}</span>
        </div>
        <div className="hidden sm:block">{t("tagline")}</div>
      </motion.div>

      {/* Scroll indicator — sits above the footer meta row */}
      <motion.div
        className="absolute inset-x-0 bottom-16 z-20 flex justify-center"
        initial={{ opacity: 0 }}
        animate={started ? { opacity: 0.6 } : { opacity: 0 }}
        transition={{ duration: 0.8 * SLOW, delay: 1.2 * SLOW }}
      >
        <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-mist/60">
          <span>{t("scroll")}</span>
          <motion.span
            className="block h-8 w-px bg-gradient-to-b from-neon-300 to-transparent"
            animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
