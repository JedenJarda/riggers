"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { EuropeMap } from "./EuropeMap";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Wordmark } from "./Wordmark";
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
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setStarted(true);
  }, []);

  // Mobile-only: shift map so Prague lands 8px from the right edge and
  // 8px above the BOOK US button's top. Desktop layout untouched.
  useEffect(() => {
    function applyMobileShift() {
      const wrap = mapWrapRef.current;
      const cta = ctaRef.current;
      if (!wrap || !cta) return;
      const W = window.innerWidth;
      const isMobile = W < 768;
      if (!isMobile) {
        wrap.style.width = "";
        wrap.style.left = "";
        wrap.style.right = "";
        wrap.style.transform = "";
        wrap.style.maskImage = "";
        wrap.style.webkitMaskImage = "";
        wrap.style.maskComposite = "";
        wrap.style.webkitMaskComposite = "";
        return;
      }
      const H = window.innerHeight;
      const buttonTop = cta.getBoundingClientRect().top;
      // EuropeMap uses xMaxYMid slice on viewBox (0, 0, 960, 540) with
      // Prague at PROJ (864, 270).
      // Strategy on mobile: widen the wrapper past the viewport right
      // edge so the slice's xMax alignment puts Prague ~18px from the
      // viewport right, while the wrapper still starts at left:0 — so
      // the map content reaches all the way to the left edge of the
      // screen (no horizontal gap). Vertical Y is shifted so Prague
      // lands 8px above the CTA's top.
      const scale = Math.max(W / viewW, H / viewH);
      const targetRightOffset = 18;
      const extraRight = (viewW - 864) * scale - targetRightOffset;
      wrap.style.left = "0";
      wrap.style.right = "auto";
      wrap.style.width = `${W + extraRight}px`;
      const ty = (buttonTop - 8) - H / 2;
      wrap.style.transform = `translateY(${ty}px)`;
      // 20px fade on top + left edges so the hard cut against the dark
      // background goes soft.
      const fade =
        "linear-gradient(to bottom, transparent 0, black 20px, black 100%), " +
        "linear-gradient(to right, transparent 0, black 20px, black 100%)";
      // Set legacy first, modern second — some browsers alias
      // -webkit-mask-composite into mask-composite when written via the
      // CSSOM, so writing modern second guarantees `intersect` survives.
      wrap.style.webkitMaskImage = fade;
      wrap.style.maskImage = fade;
      wrap.style.webkitMaskComposite = "source-in";
      wrap.style.maskComposite = "intersect";
    }
    applyMobileShift();
    // CTA enters via a motion translateY that takes ~0.78s to settle —
    // re-measure once it has, so the shift uses the final button position.
    const settleTimer = window.setTimeout(applyMobileShift, 1500);
    window.addEventListener("resize", applyMobileShift);
    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", applyMobileShift);
    };
  }, [viewW, viewH]);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink-950">
      {/* Map layer — full bleed on desktop. On mobile a JS effect above
          shifts this wrapper via CSS transform so Prague pins next to the
          BOOK US button. */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_60%_45%,#0d1230_0%,#070a1c_55%,#04050a_90%)]">
        <div ref={mapWrapRef} className="absolute inset-0">
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

      {/* Top bar — wordmark left, language switcher right. */}
      <div className="absolute inset-x-0 top-0 z-30">
        <div className="flex items-start justify-between px-6 py-7 md:px-12 lg:px-20">
          <Wordmark size="md" className="mt-[50px]" />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Headline / subhead / CTA — anchored left within the 1140 frame */}
      <div className="relative z-20 flex min-h-[100svh] flex-col justify-center px-6 md:px-12 lg:px-20">
        <div className="mt-10 max-w-xl md:max-w-2xl">
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
              ref={ctaRef}
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

    </section>
  );
}
