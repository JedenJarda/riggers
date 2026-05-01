"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

type MemberId = "jarda" | "ales" | "filip" | "petr" | "hugo";

const PHOTO_GRADIENTS: Record<MemberId, string> = {
  jarda: "from-[#5a2a85] via-[#b829e8] to-[#3a4a96]",
  ales: "from-[#4a2a85] via-[#8e3dd8] to-[#2d336b]",
  filip: "from-[#6a3aa0] via-[#c149ff] to-[#3a4a96]",
  petr: "from-[#3d2785] via-[#a040d0] to-[#2d4a96]",
  hugo: "from-[#5d2a95] via-[#c64eff] to-[#3a3a86]",
};

export function CrewModal({
  memberId,
  onClose,
}: {
  memberId: MemberId | null;
  onClose: () => void;
}) {
  const t = useTranslations("Crew");

  // ESC to dismiss + lock body scroll while open.
  useEffect(() => {
    if (!memberId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [memberId, onClose]);

  return (
    <AnimatePresence>
      {memberId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={t(`members.${memberId}.name`)}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="absolute inset-0 cursor-default bg-ink-950/85 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-neon-400/25 bg-ink-900 shadow-[0_40px_80px_-20px_rgba(184,41,232,0.3)] md:flex-row"
          >
            <div
              className={`relative h-64 w-full shrink-0 overflow-hidden bg-gradient-to-br md:h-auto md:w-72 ${PHOTO_GRADIENTS[memberId]}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.2),transparent_60%)]" />
              <span className="absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.28em] text-cream/60">
                {t("photoComing")}
              </span>
            </div>

            <div className="flex max-h-[70vh] flex-1 flex-col overflow-y-auto px-6 py-7 md:px-8 md:py-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="whitespace-pre-line text-xs uppercase tracking-[0.28em] text-neon-300">
                    {t(`members.${memberId}.role`)}
                  </div>
                  <h3 className="mt-2 font-display text-4xl font-medium text-cream">
                    {t(`members.${memberId}.name`)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("close")}
                  className="rounded-full border border-mist/20 p-2 text-mist/80 transition-colors hover:border-neon-400/60 hover:text-cream"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>

              <p className="mt-6 text-base leading-relaxed text-mist/85">
                {t(`members.${memberId}.shortBio`)}
              </p>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-mist/80">
                {t(`members.${memberId}.longBio`)}
              </p>
              {t(`members.${memberId}.projects`).trim() && (
                <p className="mt-4 text-base leading-relaxed text-mist/70">
                  {t(`members.${memberId}.projects`)}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-1.5">
                {t(`members.${memberId}.tags`)
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
