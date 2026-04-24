"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion } from "motion/react";
import { Eyebrow, SectionFrame } from "./SectionFrame";
import { CrewModal } from "./CrewModal";

// Member ids match keys under Crew.members in the i18n messages.
const MEMBER_IDS = ["jarda", "ales", "filip"] as const;
type MemberId = (typeof MEMBER_IDS)[number];

const TAG_COLORS: Record<MemberId, string> = {
  jarda: "from-[#5a2a85] via-[#b829e8] to-[#3a4a96]",
  ales: "from-[#4a2a85] via-[#8e3dd8] to-[#2d336b]",
  filip: "from-[#6a3aa0] via-[#c149ff] to-[#3a4a96]",
};

export function Crew() {
  const t = useTranslations("Crew");
  const [openMember, setOpenMember] = useState<MemberId | null>(null);

  return (
    <SectionFrame id="crew" className="bg-ink-950 py-28 md:py-36">
      <div className="mx-auto max-w-6xl px-6 md:px-12 lg:px-20">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h2 className="font-display text-4xl font-medium text-cream sm:text-5xl md:text-6xl">
          {t("heading")}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-mist/75 md:text-lg">
          {t("subhead")}
        </p>

        <div className="mt-14 flex flex-wrap justify-center gap-6 sm:grid sm:grid-cols-2 sm:justify-items-stretch lg:grid-cols-3">
          {MEMBER_IDS.map((id, i) => (
            <motion.button
              key={id}
              type="button"
              onClick={() => setOpenMember(id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="group relative w-full max-w-xs overflow-hidden rounded-2xl bg-ink-900/60 p-0 text-left transition-transform duration-300 hover:-translate-y-1 sm:max-w-none"
            >
              {/* Animated neon border — a conic gradient sweeping around
                  the card, matching the neon-tube feel of the logo. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl p-[1.5px] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "conic-gradient(from var(--border-angle,0deg), transparent 0deg, #b829e8 40deg, #d172ff 80deg, transparent 120deg, transparent 360deg)",
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  animation: "crew-border-spin 6s linear infinite",
                }}
              />
              <div className="relative rounded-2xl bg-ink-900">
                {/* Photo slot — gradient placeholder until real work
                    photos arrive from Jarda. */}
                <div
                  className={`relative aspect-[4/5] w-full overflow-hidden rounded-t-2xl bg-gradient-to-br ${TAG_COLORS[id]}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                  <span className="absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.28em] text-cream/60">
                    {t("photoComing")}
                  </span>
                </div>
                <div className="px-5 py-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-2xl font-medium text-cream">
                      {t(`members.${id}.name`)}
                    </h3>
                    <span className="text-xs uppercase tracking-[0.18em] text-neon-300">
                      {t(`members.${id}.role`)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-mist/75">
                    {t(`members.${id}.shortBio`)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t(`members.${id}.tags`)
                      .split("·")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-neon-400/30 bg-neon-500/5 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-neon-200"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <CrewModal
        memberId={openMember}
        onClose={() => setOpenMember(null)}
      />
    </SectionFrame>
  );
}
