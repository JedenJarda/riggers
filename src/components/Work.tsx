"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Eyebrow, SectionFrame } from "./SectionFrame";

const VENUES = [
  "O2 Arena Prague",
  "Hallenstadion Zürich",
  "Mercedes-Benz Arena Berlin",
  "Ziggo Dome Amsterdam",
  "Johan Cruijff Arena Amsterdam",
  "Lanxess Arena Köln",
  "Barclays Arena Hamburg",
  "Festhalle Frankfurt",
  "Palau Sant Jordi Barcelona",
  "Milano",
  "Paris",
  "Antwerpen",
  "Brussels",
  "Wien",
  "Palma de Mallorca",
];

const ARTISTS = [
  "Metallica",
  "Taylor Swift",
  "Lady Gaga",
  "Ed Sheeran",
  "Billie Eilish",
  "Harry Styles",
  "Bruce Springsteen",
  "The Weeknd",
];

export function Work() {
  const t = useTranslations("Work");

  return (
    <SectionFrame id="work" className="bg-ink-950 py-28 md:py-36">
      <div className="mx-auto max-w-6xl space-y-24 px-6 md:px-12 lg:px-20">
        {/* Venues */}
        <div>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="font-display text-4xl font-medium text-cream sm:text-5xl md:text-6xl">
            {t("venuesHeading")}
          </h2>
          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10% 0px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04 } },
            }}
            className="mt-10 flex flex-wrap gap-2.5"
          >
            {VENUES.map((v) => (
              <motion.li
                key={v}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                className="rounded-full border border-mist/15 bg-ink-900/60 px-4 py-2 text-sm text-mist/85 transition-colors duration-300 hover:border-neon-400/50 hover:text-cream"
              >
                {v}
              </motion.li>
            ))}
          </motion.ul>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-mist/75 md:text-lg">
            {t("venuesCaption")}
          </p>
        </div>

        {/* Tours & productions */}
        <div>
          <h3 className="font-display text-3xl font-medium text-cream sm:text-4xl md:text-5xl">
            {t("toursHeading")}
          </h3>
          <p className="mt-8 max-w-3xl text-base leading-relaxed text-mist/80 md:text-lg">
            {t("toursIntro", {
              artists: (
                <strong className="font-semibold text-cream">
                  {ARTISTS.join(", ")}
                </strong>
              ) as unknown as string,
            })}
          </p>

          <div className="mt-10 max-w-3xl">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-neon-300">
              {t("highlightsLabel")}
            </div>
            <ul className="space-y-3 text-mist/85">
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-neon-400 shadow-[0_0_6px_#b829e8]" />
                <span>{t("highlights.esc")}</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-neon-400 shadow-[0_0_6px_#b829e8]" />
                <span>{t("highlights.cirque")}</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-neon-400 shadow-[0_0_6px_#b829e8]" />
                <span>{t("highlights.laver")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
