"use client";

import Image from "next/image";
import { motion } from "motion/react";
import letters from "@/lib/logo-letters.json";

type Props = {
  /** Rendered width in px. Height scales from the source's aspect ratio. */
  width?: number;
  className?: string;
  /** When true, flicker starts. Gated from Hero so visuals sync with audio. */
  started: boolean;
};

const NEON_GLOW =
  "drop-shadow(0 0 1px #fce6ff) drop-shadow(0 0 3px #f0c9ff) drop-shadow(0 0 8px #d172ff) drop-shadow(0 0 16px #b829e8)";

// Base timing matches /neon-lights.m4a peaks:
//   0.460 (initial click), 0.905, 1.130, 1.320, 2.005, 2.750,
//   3.410, 3.740, 3.860 — then ambient hum, faded out in Hero.
//
// Timeline splits at BREAKPOINT_BASE (2.005s — the moment "gg"/"c" stop
// flickering and settle). Everything before runs at SLOW (30% slower than
// base). Everything after runs at SLOW × SPEEDUP (30% faster than SLOW →
// back close to real time). Audio mirrors this in Hero via a playbackRate
// switch at the breakpoint, so audio peaks keep landing on flicker peaks.
const SLOW = 1.3;
// 0.7 → 0.595 (an extra 15% speed-up on top of the earlier compression).
const SPEEDUP = 0.595;
const BASE_DURATION = 4.0;
const BASE_SETTLE = 3.86;
export const BREAKPOINT_BASE = 2.005;
export const BREAKPOINT_REAL = BREAKPOINT_BASE * SLOW;  // 2.6065s

// Piecewise base → real time mapping. Keeps flicker keyframes in lockstep
// with the audio's currentTime (which drifts identically when we switch
// playbackRate from 1/SLOW to 1/(SLOW × SPEEDUP) at BREAKPOINT_REAL).
function scaleTime(tBase: number): number {
  if (tBase <= BREAKPOINT_BASE) return tBase * SLOW;
  return BREAKPOINT_REAL + (tBase - BREAKPOINT_BASE) * SLOW * SPEEDUP;
}

export const LOGO_DURATION = scaleTime(BASE_DURATION);      // 4.4215s
const FULL_SETTLE = scaleTime(BASE_SETTLE);                 // 4.2945s

// One brief "flash" event: [t, peak] becomes a click-on/click-off pair
// — explicit zero immediately before t and ~50ms after, so motion's
// linear interpolation between keyframes can't create a slow ramp.
type Flash = [number, number]; // [time, peakOpacity] in *base* seconds
const STEP = 0.02 * SLOW; // short enough to read as instant (all flashes
                          // occur pre-breakpoint, so no SPEEDUP needed)
const OFF = 0.4 * SLOW;   // flash-visible hold (pre-breakpoint only)

// Holds and ramps during/after the dim cascade.
const PARTIAL = 0.85;
const SAG_FACTOR = 0.8;   // each new settle dims the already-lit by 20%
const RAMP_BASE = 0.12;   // base seconds of final ramp from sagged → 1.0

// Global timeline of settle events — order matters; flicker() dims the
// letter once for every event strictly later than its own settle and
// earlier than the final burst.
const SETTLE_EVENTS_BASE = [1.13, 2.005, 2.75, 3.41, 3.74];

function flicker(
  flashes: Flash[],
  partialSettleBase: number,
  partialLevel = 1,
): { op: number[]; t: number[] } {
  const partialSettle = scaleTime(partialSettleBase);
  const op: number[] = [0];
  const t: number[] = [0];
  for (const [timeBase, peak] of flashes) {
    const time = scaleTime(timeBase);
    if (time - STEP > t[t.length - 1]) {
      t.push(time - STEP);
      op.push(0);
    }
    t.push(time);
    op.push(peak);
    t.push(time + OFF);
    op.push(0);
  }
  if (partialSettle - STEP > t[t.length - 1]) {
    t.push(partialSettle - STEP);
    op.push(0);
  }
  t.push(partialSettle);
  op.push(partialLevel);

  // Letters that settle *at* FULL_SETTLE (only "z") skip the cascade —
  // they light directly full as the final note.
  if (partialSettle < FULL_SETTLE) {
    let level = partialLevel;
    for (const eventBase of SETTLE_EVENTS_BASE) {
      const event = scaleTime(eventBase);
      if (event <= partialSettle + STEP) continue;
      level *= SAG_FACTOR;
      // Hold prev level, then drop in one STEP — reads as a sharp sag,
      // not a linear fade.
      t.push(event - STEP);
      op.push(level / SAG_FACTOR);
      t.push(event);
      op.push(level);
    }
    // Final burst: ramp sagged level up to 1.0 at FULL_SETTLE.
    // Post-breakpoint, so the ramp itself is compressed by SPEEDUP.
    const rampStart = Math.max(
      t[t.length - 1] + STEP,
      FULL_SETTLE - RAMP_BASE * SLOW * SPEEDUP,
    );
    if (rampStart > t[t.length - 1]) {
      t.push(rampStart);
      op.push(level);
    }
    t.push(FULL_SETTLE);
    op.push(1);
  }

  t.push(LOGO_DURATION);
  op.push(1);
  return { op, t: t.map((x) => x / LOGO_DURATION) };
}

// Choreography: from 2.005s on, whatever has lit stays lit at PARTIAL.
// Each "flash moment" after 2.005 becomes a partial-settle instead of a
// flash+zero. At BASE_SETTLE (3.86s) "z" blinks on full and the entire
// sign ramps PARTIAL → 1.0 together.
const FLICKER = [
  // "ri" — 2 flashes (0.46, 1.13), then dark until partial settle @ 3.74
  flicker([[0.46, 0.7], [1.13, 0.9]], 3.74, PARTIAL),
  // "gg" — 2 flashes (0.46, 0.905); the 3rd flash moment (2.005) is
  // replaced by a partial settle
  flicker([[0.46, 0.6], [0.905, 0.5]], 2.005, PARTIAL),
  // "er" — 2 flashes (0.46, 1.32); the weak flash @ 2.75 becomes a settle
  flicker([[0.46, 0.7], [1.32, 0.6]], 2.75, PARTIAL),
  // "s" — 1 flash (0.46); "trying to turn on" @ 3.41 becomes a settle
  flicker([[0.46, 0.4]], 3.41, PARTIAL),
  // "." — stays special: full-brightness flash @ 0.46, full settle @ 1.13,
  // holds full the entire time (little tube proudly lit while the rest
  // struggles to stabilize)
  flicker([[0.46, 1]], 1.13),
  // "c" — like "gg": 2 flashes then partial settle @ 2.005
  flicker([[0.46, 0.5], [0.905, 0.7]], 2.005, PARTIAL),
  // "z" — 1 flash (0.46), dark through the middle, then blinks on full
  // at BASE_SETTLE as the final note of the crescendo
  flicker([[0.46, 0.3]], BASE_SETTLE),
];

export function Logo({ width = 280, className = "", started }: Props) {
  const scale = width / letters.totalWidth;
  const height = letters.totalHeight * scale;

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width, height }}
      aria-label="riggers.cz"
      role="img"
    >
      {/* Unlit glass tube — barely-there outline. Visible from page load
          even before the flicker fires, so the sign reads as "off neon
          on a wall" rather than empty space. */}
      <Image
        src="/logo-mark.png"
        alt=""
        width={letters.totalWidth}
        height={letters.totalHeight}
        priority
        style={{
          width: "100%",
          height: "100%",
          opacity: 0.13,
          display: "block",
        }}
      />

      {/* Lit overlay — wraps per-letter flickers with a slow breathing
          pulse that fades in once the startup animation has settled. */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={started ? { opacity: [1, 0.96, 1] } : { opacity: 1 }}
        transition={
          started
            ? {
                duration: 5 * SLOW * SPEEDUP,
                delay: LOGO_DURATION + 0.6 * SLOW * SPEEDUP,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : { duration: 0 }
        }
        style={{ filter: NEON_GLOW }}
      >
        {letters.letters.map((letter, i) => {
          const f = FLICKER[i] ?? FLICKER[FLICKER.length - 1];
          return (
            <motion.div
              key={i}
              className="absolute top-0"
              style={{
                left: letter.x * scale,
                width: letter.w * scale,
                height,
              }}
              initial={{ opacity: 0 }}
              animate={started ? { opacity: f.op } : { opacity: 0 }}
              transition={
                started
                  ? { duration: LOGO_DURATION, times: f.t, ease: "linear" }
                  : { duration: 0 }
              }
            >
              <Image
                src={letter.src}
                alt=""
                width={letter.w}
                height={letters.totalHeight}
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
