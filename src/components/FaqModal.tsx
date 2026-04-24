"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

type Item = { q: string; a: string };

export function FaqModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Faq");
  const items = t.raw("items") as Item[];
  const [expanded, setExpanded] = useState<number | null>(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="FAQ"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="absolute inset-0 cursor-default bg-ink-950/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neon-400/25 bg-ink-900 shadow-[0_40px_80px_-20px_rgba(184,41,232,0.25)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-mist/10 px-6 py-5 md:px-8 md:py-6">
              <h3 className="font-display text-3xl font-medium text-cream md:text-4xl">
                {t("heading")}
              </h3>
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

            <ul className="divide-y divide-mist/10 overflow-y-auto px-6 py-2 md:px-8">
              {items.map((item, i) => {
                const isOpen = expanded === i;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : i)}
                      className="group flex w-full items-start justify-between gap-4 py-5 text-left transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="font-medium text-cream group-hover:text-neon-200">
                        {item.q}
                      </span>
                      <span
                        className={`mt-1 flex-none text-neon-300 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="a"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 pr-8 text-sm leading-relaxed text-mist/80 md:text-base">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
