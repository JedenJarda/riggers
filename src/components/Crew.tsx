"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion } from "motion/react";
import { Eyebrow, SectionFrame } from "./SectionFrame";
import { CrewModal } from "./CrewModal";

const MEMBER_IDS = ["jarda", "ales", "filip", "petr", "hugo"] as const;
type MemberId = (typeof MEMBER_IDS)[number];

const PHOTO_GRADIENTS: Record<MemberId, string> = {
  jarda: "from-[#5a2a85] via-[#b829e8] to-[#3a4a96]",
  ales: "from-[#4a2a85] via-[#8e3dd8] to-[#2d336b]",
  filip: "from-[#6a3aa0] via-[#c149ff] to-[#3a4a96]",
  petr: "from-[#3d2785] via-[#a040d0] to-[#2d4a96]",
  hugo: "from-[#5d2a95] via-[#c64eff] to-[#3a3a86]",
};

function MedallionCard({
  id,
  index,
  onOpen,
}: {
  id: MemberId;
  index: number;
  onOpen: () => void;
}) {
  const t = useTranslations("Crew");
  const [halfTurns, setHalfTurns] = useState(0);

  // Forward-only rotation: each hover-in bumps to next odd halfTurn
  // (photo visible), each hover-out bumps to next even (text visible).
  // The transform value just keeps growing, so the coin always rotates
  // the same direction and completes a full 360° per cycle.
  const showPhoto = () =>
    setHalfTurns((h) => (h % 2 === 0 ? h + 1 : h));
  const showText = () =>
    setHalfTurns((h) => (h % 2 === 1 ? h + 1 : h));

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onMouseEnter={showPhoto}
      onMouseLeave={showText}
      onFocus={showPhoto}
      onBlur={showText}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      aria-label={t(`members.${id}.name`)}
      className="group relative aspect-square w-[280px] max-w-full p-0 [perspective:1200px]"
    >
      {/* Flipper — text face at +Z, photo face at -Z (mirrored), and
          a stack of thin rings between them to fake the cylindrical
          edge. No masks, no conic gradients, no shimmer overlays —
          everything is plain bordered divs that survive 3D transforms
          cleanly across browsers. */}
      <div
        className="relative h-full w-full [transform-style:preserve-3d] transition-transform duration-[1008ms] ease-out"
        style={{ transform: `rotateY(${halfTurns * 180}deg)` }}
      >
        {/* Rim — a single neon ring at z=0 between the two faces.
            From face-on it collapses behind the front face; at edge-on
            it shows as one thin solid line; mid-rotation it joins the
            two faces. No more stacked stripes. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-neon-500/45"
          style={{ transform: "translateZ(0)" }}
        />

        {/* Default face — name + role + skills, lifted toward viewer.
            Both wrapper AND inner have backface-visibility:hidden —
            backface-visibility does NOT propagate to children, so the
            inner gradient leaks through whenever the wrapper alone has
            it. The wrapper also gets transform-style:flat to force the
            inner clip into a 2D rasterization pass (Chrome fails to
            apply rounded-full + overflow-hidden inside a parent's
            preserve-3d context). */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform-style:flat]"
          style={{ transform: "translateZ(12px)" }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-full border border-neon-400/45 bg-ink-900 px-8 text-center [backface-visibility:hidden] [clip-path:circle(50%)]">
            <span className="whitespace-pre-line text-[10px] uppercase tracking-[0.24em] text-neon-300">
              {t(`members.${id}.role`)}
            </span>
            <h3 className="font-display text-3xl font-medium text-cream">
              {t(`members.${id}.name`)}
            </h3>
            <p className="max-w-[85%] text-sm leading-relaxed text-cream">
              {t(`members.${id}.cardLine`)}
            </p>
          </div>
        </div>

        {/* Hover face — photo placeholder, pushed away and mirrored. */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform-style:flat]"
          style={{ transform: "translateZ(-12px) rotateY(180deg)" }}
        >
          <div
            className={`absolute inset-0 overflow-hidden rounded-full border border-neon-400/45 bg-gradient-to-br ${PHOTO_GRADIENTS[id]} [backface-visibility:hidden] [clip-path:circle(50%)]`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,rgba(255,255,255,0.18),transparent_65%)]" />
            <span className="absolute inset-x-0 bottom-10 text-center text-[10px] uppercase tracking-[0.28em] text-cream/60">
              {t("photoComing")}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export function Crew() {
  const t = useTranslations("Crew");
  const [openMember, setOpenMember] = useState<MemberId | null>(null);

  return (
    <SectionFrame id="crew" className="bg-ink-950 pt-28 md:pt-36 pb-28 md:pb-[74px]">
      <div className="mx-auto max-w-6xl px-6 md:px-12 lg:px-20">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h2 className="font-display text-4xl font-medium text-cream sm:text-5xl md:text-6xl">
          {t("heading")}
        </h2>
        <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed md:text-lg">
          <p className="text-cream">{t("p1")}</p>
          <p className="text-mist/75">{t("p2")}</p>
          <p className="text-mist/75">{t("p3")}</p>
          <p className="text-cream">{t("p4")}</p>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-10 sm:gap-12">
          {MEMBER_IDS.map((id, i) => (
            <MedallionCard
              key={id}
              id={id}
              index={i}
              onOpen={() => setOpenMember(id)}
            />
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
