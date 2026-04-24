"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Eyebrow, SectionFrame } from "./SectionFrame";

const SERVICE_KEYS = [
  "rigging",
  "climbing",
  "groundSupport",
  "plots",
  "consultations",
  "stage",
] as const;

// Small inline glyphs — neutral line art rather than polished icons so
// they feel at home next to the neon accent without competing with it.
const ICONS: Record<(typeof SERVICE_KEYS)[number], React.ReactNode> = {
  rigging: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M6 8h28M12 8v5M20 8v5M28 8v5" />
      <path d="M20 13v14" />
      <circle cx="20" cy="30" r="3" />
    </svg>
  ),
  climbing: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 6c0 6-4 8-4 14s4 8 4 14" />
      <circle cx="22" cy="14" r="3" />
      <path d="M22 17l2 6-4 3 4 5" />
    </svg>
  ),
  groundSupport: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M6 32h28M10 32V14M30 32V14M10 14l10-6 10 6M14 32v-8h12v8" />
    </svg>
  ),
  plots: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="6" y="6" width="28" height="28" rx="2" />
      <path d="M6 14h28M14 6v28M22 14v20M6 22h16" />
    </svg>
  ),
  consultations: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="20" cy="20" r="12" />
      <path d="M20 8v24M8 20h24" />
      <circle cx="20" cy="20" r="4" />
    </svg>
  ),
  stage: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 28h32M8 28V14h24v14M14 14V8h12v6" />
      <path d="M14 22h12" />
    </svg>
  ),
};

export function WhatWeDo() {
  const t = useTranslations("Services");

  return (
    <SectionFrame id="services" className="bg-ink-950 py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6 md:px-12 lg:px-20">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h2 className="font-display text-4xl font-medium text-cream sm:text-5xl md:text-6xl">
          {t("heading")}
        </h2>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_KEYS.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-xl border border-mist/10 bg-ink-900/60 p-6 transition-colors duration-300 hover:border-neon-400/50"
            >
              {/* Purple tint on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neon-500/0 via-neon-500/0 to-neon-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="relative">
                <div className="mb-5 h-10 w-10 text-neon-300/80 transition-colors duration-300 group-hover:text-neon-200">
                  {ICONS[key]}
                </div>
                <h3 className="font-display text-xl font-medium text-cream">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist/70">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}
