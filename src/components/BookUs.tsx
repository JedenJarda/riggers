"use client";

import { useState } from "react";
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
  const [eventType, setEventType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError(t("form.required"));
      return;
    }
    if (!emailValid(email)) {
      setEmailError(t("form.invalidEmail"));
      return;
    }
    setEmailError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dates: Array.from(dates).sort(),
          venue,
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

            <div className="grid gap-5 md:grid-cols-2">
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
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-mist/60">
                  {t("form.email")}{" "}
                  <span className="text-neon-300">*</span>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  required
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
                className="group inline-flex items-center justify-center gap-3 border border-neon-400/70 bg-transparent px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-cream transition-all duration-300 hover:border-neon-300 hover:bg-neon-500/10 hover:[box-shadow:var(--shadow-neon-md)] disabled:opacity-60"
              >
                {status === "submitting" ? t("form.submitting") : t("form.submit")}
                <span aria-hidden className="text-neon-300 transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </button>

              <p className="text-sm text-mist/70">
                {t.rich("alternative", {
                  email: () => (
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-neon-200 underline-offset-4 hover:underline"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  ),
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
          </form>
        )}
      </div>
    </SectionFrame>
  );
}
