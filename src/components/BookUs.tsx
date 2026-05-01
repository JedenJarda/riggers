"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Eyebrow, SectionFrame } from "./SectionFrame";
import { Calendar } from "./Calendar";

// Placeholders — Jarda overrides with the real channel contacts before
// go-live. Kept here (not in i18n) so changes are a single edit.
const CONTACT_EMAIL = "booking@riggers.cz";
const CONTACT_PHONE = "+420 733 284 648";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function BookUs() {
  const t = useTranslations("Book");
  const locale = useLocale();
  const [dates, setDates] = useState<Set<string>>(new Set());
  const [venue, setVenue] = useState("");
  const [riggers, setRiggers] = useState<number | null>(null);
  const [eventType, setEventType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [riggersOpen, setRiggersOpen] = useState(false);
  const [confirmNoDates, setConfirmNoDates] = useState(false);
  const riggersRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!riggersOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!riggersRef.current?.contains(e.target as Node)) {
        setRiggersOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setRiggersOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [riggersOpen]);

  useEffect(() => {
    if (!confirmNoDates) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmNoDates(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [confirmNoDates]);

  const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function flagEmail(message: string) {
    setEmailError(message);
    emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => emailRef.current?.focus({ preventScroll: true }), 320);
  }

  async function sendBooking() {
    setStatus("submitting");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dates: Array.from(dates).sort(),
          venue,
          riggers,
          eventType,
          email,
          phone,
          note,
        }),
      });
      if (!res.ok) throw new Error("bad response");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      flagEmail(t("form.required"));
      return;
    }
    if (!emailValid(email)) {
      flagEmail(t("form.invalidEmail"));
      return;
    }
    setEmailError(null);
    if (dates.size === 0) {
      setConfirmNoDates(true);
      return;
    }
    void sendBooking();
  }

  const fieldBase =
    "w-full rounded-md border border-mist/20 bg-ink-900/60 px-4 py-3 text-sm text-cream placeholder:text-mist/40 transition-colors focus:border-neon-400/70 focus:outline-none";

  return (
    <SectionFrame id="book" className="bg-ink-950 py-28 md:pt-36 md:pb-[74px]">
      <div className="mx-auto max-w-5xl px-6 md:px-12 lg:px-20">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h2 className="font-display text-4xl font-medium text-cream sm:text-5xl md:text-6xl">
          {t("heading")}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream/90 md:text-lg">
          {t("intro")}
        </p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-mist/75 md:text-lg">
          {t("subhead")}
        </p>

        {status === "success" ? (
          <div className="mt-14 rounded-2xl border border-neon-400/40 bg-neon-500/10 px-8 py-12 text-center">
            <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-neon-400/50 text-neon-200">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-display text-2xl text-cream">{t("form.success")}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-14 space-y-10">
            {/* Calendar */}
            <div className="rounded-2xl border border-mist/10 bg-ink-900/40 p-5 md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.22em] text-mist/60">
                <span>{t("calendarLegend")}</span>
                <span>
                  {t("selectedLabel")}:{" "}
                  <span className="text-neon-200">{dates.size}</span>
                </span>
              </div>
              <Calendar value={dates} onChange={setDates} locale={locale} />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-mist/60">
                  {t("form.venue")}
                </span>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className={fieldBase}
                />
              </label>
              <div className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-mist/60">
                  {t("form.riggers")}
                </span>
                <div ref={riggersRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setRiggersOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={riggersOpen}
                    className={`${fieldBase} flex items-center justify-between text-left`}
                  >
                    <span className={riggers === null ? "text-mist/40" : ""}>
                      {riggers ?? " "}
                    </span>
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                      stroke="#d172ff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${riggersOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    >
                      <polyline points="1 1 6 6 11 1" />
                    </svg>
                  </button>
                  {riggersOpen && (
                    <ul
                      role="listbox"
                      className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-md border border-mist/20 bg-ink-900 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <li key={n}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={riggers === n}
                            onClick={() => {
                              setRiggers(riggers === n ? null : n);
                              setRiggersOpen(false);
                            }}
                            className={`block w-full px-4 py-3 text-left text-sm transition-colors duration-150 hover:bg-neon-500/25 ${
                              riggers === n
                                ? "bg-neon-500/15 text-neon-200"
                                : "text-cream"
                            }`}
                          >
                            {n}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-mist/60">
                  {t("form.eventType")}
                </span>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className={fieldBase}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-mist/60">
                  {t("form.email")}{" "}
                  <span className="text-neon-300">*</span>
                </span>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  required
                  aria-invalid={emailError ? true : undefined}
                  className={`${fieldBase} ${emailError ? "border-red-500/60" : ""}`}
                />
                {emailError && (
                  <span className="mt-1 block text-xs text-red-400">
                    {emailError}
                  </span>
                )}
              </label>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-mist/60">
                  {t("form.phone")}{" "}
                  <span className="text-mist/40 normal-case tracking-normal">
                    ({t("form.phoneHint")})
                  </span>
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldBase}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-mist/60">
                {t("form.note")}
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("form.notePlaceholder")}
                rows={4}
                className={fieldBase}
              />
            </label>

            {status === "error" && (
              <p className="text-sm text-red-400">{t("form.error")}</p>
            )}

            <div className="flex flex-col gap-6 border-t border-mist/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="group inline-flex shrink-0 items-center justify-center gap-3 whitespace-nowrap border border-neon-400/70 bg-transparent px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-neon-300 hover:bg-neon-500/10 hover:[box-shadow:var(--shadow-neon-md)] disabled:opacity-60"
              >
                {status === "submitting" ? t("form.submitting") : t("form.submit")}
                <span aria-hidden className="text-neon-300 transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </button>

              <div className="text-right text-sm font-medium uppercase tracking-[0.22em] text-mist/70">
                <p>
                  {t.rich("alternative", {
                    email: () => (
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="text-neon-200 underline-offset-4 hover:underline"
                      >
                        {CONTACT_EMAIL}
                      </a>
                    ),
                  })}
                </p>
                <p className="mt-1">
                  {t.rich("alternativeCall", {
                    phone: () => (
                      <a
                        href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`}
                        className="text-neon-200 underline-offset-4 hover:underline"
                      >
                        {CONTACT_PHONE}
                      </a>
                    ),
                  })}
                </p>
              </div>
            </div>
          </form>
        )}
      </div>

      <AnimatePresence>
        {confirmNoDates && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="no-dates-title"
          >
            <button
              type="button"
              onClick={() => setConfirmNoDates(false)}
              aria-label={t("form.noDatesCancel")}
              className="absolute inset-0 cursor-default bg-ink-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-neon-400/30 bg-ink-900 p-7 shadow-[0_40px_80px_-20px_rgba(184,41,232,0.25)] md:p-8"
            >
              <h3
                id="no-dates-title"
                className="font-display text-2xl font-medium text-cream md:text-3xl"
              >
                {t("form.noDatesTitle")}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mist/80 md:text-base">
                {t("form.noDatesBody")}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmNoDates(false)}
                  className="inline-flex items-center justify-center rounded-md border border-mist/25 px-5 py-3 text-xs font-medium uppercase tracking-[0.22em] text-mist/80 transition-colors hover:border-mist/50 hover:text-cream"
                >
                  {t("form.noDatesCancel")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmNoDates(false);
                    void sendBooking();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-neon-400/70 bg-neon-500/10 px-5 py-3 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-all hover:border-neon-300 hover:bg-neon-500/20 hover:[box-shadow:var(--shadow-neon-md)]"
                >
                  {t("form.noDatesConfirm")}
                  <span aria-hidden className="text-neon-300">→</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionFrame>
  );
}
