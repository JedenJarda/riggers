"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { EuropeMap } from "./EuropeMap";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo, LOGO_DURATION, BREAKPOINT_REAL } from "./Logo";
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

// Mirrors Logo's timing. Audio plays at 1/SLOW before the breakpoint and
// at 1/(SLOW × SPEEDUP) after — audio peaks stay aligned with flicker
// keyframes across the piecewise scale.
const SLOW = 1.3;
const SPEEDUP = 0.595;                             // must match Logo.tsx
const AUDIO_RATE_PRE = 1 / SLOW;                   // 0.769
const AUDIO_RATE_POST = 1 / (SLOW * SPEEDUP);      // ~1.293
const AUDIO_VOLUME = 0.55;
const BREAKPOINT_MS = BREAKPOINT_REAL * 1000;      // ~2606 ms

// Audio fade-out: starts once the flicker has settled, ramps to silence
// over FADE_MS. Post-breakpoint so the fade is also compressed.
const FADE_START_MS = LOGO_DURATION * 1000;
const FADE_MS = 800 * SPEEDUP;                     // 560 ms
const FADE_STEP_MS = 16;

export function Hero({ countries, cities, routes, globe, viewX, viewY, viewW, viewH }: Props) {
  const t = useTranslations("Hero");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // `started` is the single signal everything animates on. It flips once
  // audio is actually playing — so flicker, map draw, and headline entry
  // all begin in lockstep with the neon click.
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = AUDIO_VOLUME;
    a.playbackRate = AUDIO_RATE_PRE;

    let detach: (() => void) | undefined;
    const begin = () => {
      if (!a.paused) return;
      a.currentTime = 0;
      a.play()
        .then(() => setStarted(true))
        .catch(() => {});
    };

    a.play()
      .then(() => setStarted(true))
      .catch(() => {
        const handler = () => {
          begin();
          detach?.();
        };
        const opts: AddEventListenerOptions = { once: true };
        window.addEventListener("pointerdown", handler, opts);
        window.addEventListener("keydown", handler, opts);
        window.addEventListener("scroll", handler, { ...opts, passive: true });
        window.addEventListener("touchstart", handler, opts);
        detach = () => {
          window.removeEventListener("pointerdown", handler);
          window.removeEventListener("keydown", handler);
          window.removeEventListener("scroll", handler);
          window.removeEventListener("touchstart", handler);
        };
      });

    return () => detach?.();
  }, []);

  useEffect(() => {
    if (!started) return;
    const a = audioRef.current;
    if (!a) return;

    // Flip audio to post-breakpoint rate exactly when flicker choreography
    // transitions to its compressed timeline.
    const rateTimeoutId = window.setTimeout(() => {
      a.playbackRate = AUDIO_RATE_POST;
    }, BREAKPOINT_MS);

    let intervalId: number | undefined;
    const fadeTimeoutId = window.setTimeout(() => {
      const start = performance.now();
      const startVol = a.volume;
      intervalId = window.setInterval(() => {
        const p = Math.min(1, (performance.now() - start) / FADE_MS);
        a.volume = startVol * (1 - p);
        if (p >= 1) {
          window.clearInterval(intervalId);
          a.pause();
        }
      }, FADE_STEP_MS);
    }, FADE_START_MS);

    return () => {
      window.clearTimeout(rateTimeoutId);
      window.clearTimeout(fadeTimeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [started]);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink-950">
      <audio ref={audioRef} src="/neon-lights.m4a" preload="auto" />

      {/* Map layer — full bleed, lines animate in once `started`. */}
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
        <div className="mx-auto flex max-w-[1140px] justify-end px-6 py-7 md:px-10">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Neon logo — flickers on once `started`. Sits between the top of
          the page and the headline, left-aligned with the "Your" of the H1. */}
      <div className="absolute inset-x-0 top-[20%] z-30">
        <div className="mx-auto max-w-[1140px] px-6 md:px-10">
          <Logo width={280} started={started} />
        </div>
      </div>

      {/* Headline / subhead / CTA — anchored left within the 1140 frame */}
      <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-[1140px] flex-col justify-center px-6 md:px-10">
        <div className="max-w-xl md:max-w-2xl">
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-tight text-cream"
            initial={{ opacity: 0, y: 24 }}
            animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7 * SLOW, delay: 0.3 * SLOW, ease: "easeOut" }}
          >
            {t("headline")}
          </motion.h1>
          <motion.p
            className="mt-5 text-lg sm:text-xl md:text-2xl text-mist/90 leading-snug"
            initial={{ opacity: 0, y: 16 }}
            animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.7 * SLOW, delay: 0.5 * SLOW, ease: "easeOut" }}
          >
            {t("subhead")}
          </motion.p>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 12 }}
            animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.6 * SLOW, delay: 0.7 * SLOW, ease: "easeOut" }}
          >
            <a
              href="#book"
              className="group relative inline-flex items-center gap-3 rounded-full border border-neon-400/60 bg-neon-500/10 px-7 py-3.5 text-sm md:text-base font-medium uppercase tracking-[0.18em] text-cream transition-all duration-300 hover:border-neon-300 hover:bg-neon-500/20 hover:[box-shadow:var(--shadow-neon-md)] focus:outline-none focus-visible:[box-shadow:var(--shadow-neon-md)]"
            >
              <span className="absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 [box-shadow:var(--shadow-neon-sm)]" />
              {t("cta")}
              <span aria-hidden className="text-neon-300 transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute inset-x-0 bottom-6 z-20 flex justify-center"
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
