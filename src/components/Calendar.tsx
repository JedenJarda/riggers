"use client";

import { useMemo, useState } from "react";

/**
 * Simple multi-select month calendar. No availability shown — the
 * brief explicitly asks to NOT reveal whether the crew is free on a
 * given day. Two months visible at a time on md+, one on mobile.
 * Click toggles a day; drag picks a range.
 */

type Day = {
  date: Date;      // actual Date (midnight local)
  iso: string;     // YYYY-MM-DD for stable set keys
  inMonth: boolean; // false = leading/trailing filler of the grid
  isPast: boolean;
};

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function iso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatMonth(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

function buildMonthGrid(anchor: Date, todayIso: string): Day[] {
  const first = startOfMonth(anchor);
  const grid: Day[] = [];
  // Monday-start week: JS getDay returns Sun=0..Sat=6, so shift.
  const dow = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - dow);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dIso = iso(d);
    grid.push({
      date: d,
      iso: dIso,
      inMonth: d.getMonth() === first.getMonth(),
      isPast: dIso < todayIso,
    });
  }
  return grid;
}

export function Calendar({
  value,
  onChange,
  locale,
}: {
  value: Set<string>;
  onChange: (next: Set<string>) => void;
  locale: string;
}) {
  const today = useMemo(() => iso(new Date()), []);
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));

  const months = useMemo(
    () =>
      [0, 1].map((offset) => {
        const ms = addMonths(anchor, offset);
        return { anchor: ms, grid: buildMonthGrid(ms, today) };
      }),
    [anchor, today],
  );

  // Drag-select bookkeeping — records whether the drag is adding or
  // removing days, based on the first cell touched.
  const [dragMode, setDragMode] = useState<"add" | "remove" | null>(null);

  const toggle = (dayIso: string, forceMode?: "add" | "remove") => {
    const next = new Set(value);
    const mode = forceMode ?? (next.has(dayIso) ? "remove" : "add");
    if (mode === "add") next.add(dayIso);
    else next.delete(dayIso);
    onChange(next);
    return mode;
  };

  const weekdayLabels = useMemo(() => {
    const base = new Date(2024, 0, 1); // Mon 2024-01-01
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return fmt.format(d);
    });
  }, [locale]);

  return (
    <div className="w-full">
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setAnchor((a) => addMonths(a, -1))}
          disabled={anchor.getTime() <= startOfMonth(new Date()).getTime()}
          className="rounded-full border border-mist/20 p-2 text-mist/80 transition-colors hover:border-neon-400/60 hover:text-cream disabled:opacity-30 disabled:hover:border-mist/20"
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <div className="flex gap-10 text-sm uppercase tracking-[0.22em] text-mist/75">
          {months.map((m, i) => (
            <span key={i} className={i === 1 ? "hidden md:inline" : undefined}>
              {formatMonth(m.anchor, locale)}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAnchor((a) => addMonths(a, 1))}
          className="rounded-full border border-mist/20 p-2 text-mist/80 transition-colors hover:border-neon-400/60 hover:text-cream"
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div
        className="grid gap-8 md:grid-cols-2"
        onMouseUp={() => setDragMode(null)}
        onMouseLeave={() => setDragMode(null)}
      >
        {months.map((m, i) => (
          <div key={i} className={i === 1 ? "hidden md:block" : undefined}>
            <div className="mb-2 grid grid-cols-7 text-center text-[10px] uppercase tracking-[0.2em] text-mist/50">
              {weekdayLabels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {m.grid.map((d) => {
                const selected = value.has(d.iso);
                const disabled = d.isPast;
                const muted = !d.inMonth;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    disabled={disabled}
                    onMouseDown={() => {
                      if (disabled) return;
                      const mode = toggle(d.iso);
                      setDragMode(mode);
                    }}
                    onMouseEnter={() => {
                      if (disabled || !dragMode) return;
                      const next = new Set(value);
                      if (dragMode === "add") next.add(d.iso);
                      else next.delete(d.iso);
                      onChange(next);
                    }}
                    onTouchStart={() => !disabled && toggle(d.iso)}
                    className={`
                      relative aspect-square rounded-md text-sm transition-all
                      ${muted ? "text-mist/20" : "text-mist/85"}
                      ${disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer hover:bg-neon-500/10"}
                      ${selected ? "bg-neon-500/30 text-cream shadow-[inset_0_0_0_1px_#c149ff,0_0_10px_#b829e888]" : ""}
                    `}
                  >
                    {d.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
