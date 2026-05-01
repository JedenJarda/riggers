"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { CountryPath, GlobeShape, ProjectedCity, Route } from "@/lib/europe-geo";
import {
  INITIAL_DELAY_MS,
  STAGGER_MS,
  REVEAL_SPEED_PROJ_PER_SEC,
  COUNTRY_REVEAL_MS,
  COUNTRY_PULSE_MS,
  ARC_HOLD_MS,
  ARC_FADE_OUT_MS,
  COUNTRY_PRE_OPACITY,
} from "@/lib/reveal-config";

type Props = {
  countries: CountryPath[];
  cities: ProjectedCity[];
  routes: Route[];
  globe: GlobeShape;
  viewX: number;
  viewY: number;
  viewW: number;
  viewH: number;
  /** When true the 6-second map intro begins — Prague + Czechia light
      up, then planes stagger out to their cities, lighting up each
      destination country on arrival. */
  active: boolean;
};

type FlightPhase = "flying" | "landed" | "fading";

const CZECHIA_NAME = "Czechia";

export function EuropeMap({
  countries,
  cities,
  routes,
  globe: _globe,
  viewX,
  viewY,
  viewW,
  viewH,
  active,
}: Props) {
  void _globe;

  const prague = cities.find((c) => c.origin);

  // Per-country lit flag. Czechia flips true at t=0 alongside the Prague
  // marker; the rest flip when their first plane lands (if multiple
  // cities share a country, the earliest landing wins — later planes
  // just retrigger the pulse key below).
  const [litCountries, setLitCountries] = useState<Set<string>>(new Set());

  // Pulse keys force a fresh <motion.path> re-mount so the glow pulse
  // animation runs every time a plane lands, even for countries that
  // already went through their opacity fade-in.
  const [countryPulseKey, setCountryPulseKey] = useState<Map<string, number>>(
    new Map(),
  );

  // In-flight routes keyed by city id. Entries disappear once the arc
  // finishes fading so only active/fading arcs sit in the DOM.
  const [flights, setFlights] = useState<Map<string, FlightPhase>>(new Map());

  // City ids whose plane has already landed — endpoint dots persist in
  // this set after the arc has faded away.
  const [landedCityIds, setLandedCityIds] = useState<Set<string>>(new Set());

  const [pragueShown, setPragueShown] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timeouts: number[] = [];

    // t=0 — Prague dot + Czechia reveal. Delay 0 so they're the very
    // first thing on screen when the map component becomes active.
    setPragueShown(true);
    setLitCountries((prev) => {
      if (prev.has(CZECHIA_NAME)) return prev;
      const next = new Set(prev);
      next.add(CZECHIA_NAME);
      return next;
    });
    setCountryPulseKey((prev) => {
      const next = new Map(prev);
      next.set(CZECHIA_NAME, (next.get(CZECHIA_NAME) ?? 0) + 1);
      return next;
    });

    for (const route of routes) {
      const launchAt = INITIAL_DELAY_MS + route.launchIdx * STAGGER_MS;
      const flightMs = (route.length / REVEAL_SPEED_PROJ_PER_SEC) * 1000;
      const landAt = launchAt + flightMs;
      const fadeStartAt = landAt + ARC_HOLD_MS;
      const fadeDoneAt = fadeStartAt + ARC_FADE_OUT_MS;

      timeouts.push(
        window.setTimeout(() => {
          setFlights((prev) => {
            const next = new Map(prev);
            next.set(route.id, "flying");
            return next;
          });
        }, launchAt),
      );

      timeouts.push(
        window.setTimeout(() => {
          setFlights((prev) => {
            const next = new Map(prev);
            next.set(route.id, "landed");
            return next;
          });
          setLitCountries((prev) => {
            if (prev.has(route.country)) return prev;
            const next = new Set(prev);
            next.add(route.country);
            return next;
          });
          setCountryPulseKey((prev) => {
            // Fire the arrival pulse only on the first plane to reach a
            // given country — subsequent landings (e.g. Germany's 5
            // cities) would otherwise stack into a strobe effect.
            if (prev.has(route.country)) return prev;
            const next = new Map(prev);
            next.set(route.country, 1);
            return next;
          });
          setLandedCityIds((prev) => {
            if (prev.has(route.id)) return prev;
            const next = new Set(prev);
            next.add(route.id);
            return next;
          });
        }, landAt),
      );

      timeouts.push(
        window.setTimeout(() => {
          setFlights((prev) => {
            if (prev.get(route.id) !== "landed") return prev;
            const next = new Map(prev);
            next.set(route.id, "fading");
            return next;
          });
        }, fadeStartAt),
      );

      timeouts.push(
        window.setTimeout(() => {
          setFlights((prev) => {
            if (!prev.has(route.id)) return prev;
            const next = new Map(prev);
            next.delete(route.id);
            return next;
          });
        }, fadeDoneAt),
      );
    }

    return () => {
      for (const id of timeouts) window.clearTimeout(id);
    };
  }, [active, routes]);

  return (
    <svg
      viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
      preserveAspectRatio="xMaxYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <filter id="neon-line-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Fat blur used during the per-country arrival pulse. */}
        <filter id="country-pulse-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>

        <linearGradient id="country-fill-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4a96" />
          <stop offset="100%" stopColor="#222b6a" />
        </linearGradient>
        <linearGradient id="country-fill-dim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#161b3d" />
          <stop offset="100%" stopColor="#0d1128" />
        </linearGradient>
      </defs>

      {/* Country silhouettes — always rendered. Opacity + fill shift
          dim → lit on arrival. Countries never receiving a flight
          (Ireland, Sweden, Denmark, Iceland, Portugal, …) stay dim. */}
      <g>
        {countries.map((c) => {
          const lit = litCountries.has(c.name);
          const pulseKey = countryPulseKey.get(c.name) ?? 0;
          return (
            <g key={c.name}>
              <motion.path
                d={c.d}
                stroke="#5b6dba"
                strokeWidth={0.7}
                strokeLinejoin="round"
                initial={{
                  opacity: COUNTRY_PRE_OPACITY,
                  fill: "url(#country-fill-dim)",
                }}
                animate={{
                  opacity: lit ? 1 : COUNTRY_PRE_OPACITY,
                  fill: lit
                    ? "url(#country-fill-lit)"
                    : "url(#country-fill-dim)",
                }}
                transition={{ duration: COUNTRY_REVEAL_MS / 1000, ease: "easeOut" }}
              />
              {/* Arrival pulse — a ghost of the country shape glows
                  and fades right after the plane lands. New pulseKey
                  on each arrival remounts so the animation replays even
                  when multiple cities share the country. */}
              {lit && pulseKey > 0 && (
                <motion.path
                  key={`${c.name}-pulse-${pulseKey}`}
                  d={c.d}
                  fill="#d172ff"
                  stroke="none"
                  filter="url(#country-pulse-glow)"
                  initial={{ opacity: 0.55 }}
                  animate={{ opacity: 0 }}
                  transition={{
                    duration: COUNTRY_PULSE_MS / 1000,
                    ease: "easeOut",
                  }}
                  style={{ pointerEvents: "none" }}
                />
              )}
            </g>
          );
        })}
      </g>

      {/* Active flight arcs + persistent endpoint dots. Each arc mounts
          on launch, draws pathLength 0 → 1 over its flight, fades to
          opacity 0 after landing, then unmounts. Endpoint dots in the
          same violet mount on landing and stay for the rest of the
          session — marker that the city has been visited. */}
      {/* Prague origin dot — 1.5× the destination radius, rendered
          outside the neon-line-glow group so it reads as a clean solid
          dot rather than a glowing beacon. Mounts at t=0. */}
      {prague && pragueShown && (
        <motion.circle
          className="prague-pulse"
          cx={prague.x}
          cy={prague.y}
          r={3.75}
          fill="#d172ff"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}

      <g filter="url(#neon-line-glow)">
        <AnimatePresence>
          {routes.map((route) => {
            const phase = flights.get(route.id);
            if (!phase) return null;
            const flightSec = route.length / REVEAL_SPEED_PROJ_PER_SEC;
            const isFading = phase === "fading";
            return (
              <motion.path
                key={route.id}
                d={route.d}
                stroke="#d172ff"
                strokeWidth={0.98}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                animate={{
                  // Flight: pathLength 0→1, pathOffset 0 — line draws
                  // from Prague forward to the city. Fade: pathLength
                  // 1→0 and pathOffset 0→1 simultaneously (visible
                  // window shrinks from the Prague end forward) AND
                  // opacity 0.9→0 — the line both un-draws like a
                  // contrail dissipating and dims out at the same time.
                  pathLength: isFading ? 0 : 1,
                  pathOffset: isFading ? 1 : 0,
                  opacity: isFading ? 0 : 0.9,
                }}
                transition={{
                  pathLength: isFading
                    ? { duration: ARC_FADE_OUT_MS / 1000, ease: "linear" }
                    : { duration: flightSec, ease: "linear" },
                  pathOffset: isFading
                    ? { duration: ARC_FADE_OUT_MS / 1000, ease: "linear" }
                    : { duration: 0 },
                  opacity: isFading
                    ? { duration: ARC_FADE_OUT_MS / 1000, ease: "easeOut" }
                    : { duration: 0.25, ease: "easeOut" },
                }}
              />
            );
          })}
        </AnimatePresence>
        {cities.map((city) => {
          if (city.origin) return null;
          if (!landedCityIds.has(city.id)) return null;
          return (
            <motion.circle
              key={`dot-${city.id}`}
              cx={city.x}
              cy={city.y}
              r={2.5}
              fill="#d172ff"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          );
        })}
      </g>

    </svg>
  );
}
