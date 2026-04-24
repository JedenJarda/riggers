"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FaqModal } from "./FaqModal";

// Matches the placeholders in BookUs.tsx — swap both before go-live.
const CONTACT_EMAIL = "hello@riggers.cz";
const CONTACT_PHONE = "+420 XXX XXX XXX";

export function Footer() {
  const t = useTranslations("Footer");
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <footer className="relative border-t border-mist/10 bg-ink-950 px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:justify-between">
        {/* Brand + tagline */}
        <div className="md:max-w-md">
          <div className="font-display text-xl font-medium text-cream">
            riggers<span className="text-neon-300">.cz</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-mist/70">
            {t("tagline")}
          </p>
        </div>

        {/* Contact */}
        <div>
          <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-neon-300">
            {t("contactLabel")}
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="block text-sm text-cream underline-offset-4 transition-colors hover:text-neon-200 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`}
            className="mt-1 block text-sm text-mist/80 underline-offset-4 transition-colors hover:text-neon-200 hover:underline"
          >
            {CONTACT_PHONE}
          </a>
        </div>

        {/* Certifications */}
        <div>
          <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-neon-300">
            {t("certsLabel")}
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {["IRATA", "IPAF", "A1"].map((c) => (
              <li
                key={c}
                className="rounded-full border border-neon-400/30 bg-neon-500/5 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-neon-200"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-start gap-4 border-t border-mist/10 pt-8 text-xs text-mist/55 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {t("copyright", { year: new Date().getFullYear() })}
        </span>
        <button
          type="button"
          onClick={() => setFaqOpen(true)}
          className="rounded-full border border-mist/20 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-mist/80 transition-colors hover:border-neon-400/60 hover:text-cream"
        >
          {t("faqButton")}
        </button>
      </div>

      <FaqModal open={faqOpen} onClose={() => setFaqOpen(false)} />
    </footer>
  );
}
