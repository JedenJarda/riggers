"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Eyebrow, SectionFrame } from "./SectionFrame";

const VENUES = [
  "O2 Arena Prague",
  "Uber Arena Berlin",
  "Velodrom Berlin",
  "Wien",
  "Olympiastadion Berlin",
  "Flughafen Tempelhof",
  "Lanxess Arena Köln",
  "Brussels",
  "Barclays Arena Hamburg",
  "Festhalle Frankfurt",
  "Hanns-Martin-Schleyer-Halle Stuttgart",
  "Paris",
  "Olympiahalle München",
  "Allianz Arena München",
  "Hallenstadion Zürich",
  "St. Jakobshalle Basel",
  "Stadthalle Wien",
  "Antwerpen",
  "Ziggo Dome Amsterdam",
  "Johan Cruijff Arena Amsterdam",
  "Sportpaleis Antwerpen",
  "Forest National Brussels",
  "Accor Arena Paris",
  "Milano",
  "Mediolanum Forum Milano",
  "Palau Sant Jordi Barcelona",
  "WiZink Center Madrid",
  "Oslo",
  "Palma de Mallorca",
  "Riyadh, Saudi Arabia",
  "…and many, many more",
];

export function Work() {
  const t = useTranslations("Work");

  return (
    <SectionFrame id="work" className="bg-ink-950 py-28 md:py-36">
      <div className="mx-auto max-w-6xl space-y-24 px-6 md:px-12 lg:px-20">
        {/* Venues */}
        <div>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-cream md:text-lg">
            {t("venuesIntro")}
          </p>
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
          <p className="mt-10 max-w-3xl whitespace-pre-line text-base leading-relaxed text-cream md:text-lg">
            {t("venuesCaption")}
          </p>
        </div>
      </div>
    </SectionFrame>
  );
}
