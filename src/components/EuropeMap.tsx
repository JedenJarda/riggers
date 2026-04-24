"use client";

import { Fragment, useEffect, useState } from "react";
import { motion } from "motion/react";
import type { CountryPath, GlobeShape, ProjectedCity, Route } from "@/lib/europe-geo";
import {
  REVEAL_RADIUS_PRAGUE,
  REVEAL_CORRIDOR_WIDTH,
  REVEAL_RADIUS_CITY,
  REVEAL_EDGE_SOFTNESS,
  REVEAL_EXPAND_MS,
  REVEAL_SPEED_PROJ_PER_SEC,
} from "@/lib/reveal-config";
import { LOGO_PRAGUE_TRIGGER, LOGO_LETTER_SETTLES_REAL } from "./Logo";

type Props = {
  countries: CountryPath[];
  cities: ProjectedCity[];
  routes: Route[];
  globe: GlobeShape;
  viewX: number;
  viewY: number;
  viewW: number;
  viewH: number;
  /** Flicker orchestration signal. When true, the fog lifts around Prague,
      route arcs fly out to their groups' settle triggers, and each
      destination lights up as its arc arrives. */
  active: boolean;
};

const EXPAND_S = REVEAL_EXPAND_MS / 1000;
const SOFT_SOLID_STOP = `${((1 - REVEAL_EDGE_SOFTNESS) * 100).toFixed(0)}%`;

export function EuropeMap({
  countries,
  cities,
  routes,
  // globe prop retained for API parity — not currently rendered; the
  // country silhouettes alone carry the curvature after clipAngle.
  globe: _globe,
  viewX,
  viewY,
  viewW,
  viewH,
  active,
}: Props) {
  void _globe;

  const prague = cities.find((c) => c.origin)!;
  const routeById = new Map(routes.map((r) => [r.id, r]));

  // State-flag-driven scheduling. motion's transition.delay doesn't
  // reliably gate SVG attribute animations (initial `r:0` flashes to
  // the target value on mount in some browsers), so instead each reveal
  // shape mounts into the DOM only at its scheduled moment — then
  // motion animates from initial → target with zero delay.
  const [revealStage, setRevealStage] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!active) return;
    const timeouts: number[] = [];
    const markStarted = (id: string) => {
      setRevealStage((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    };

    timeouts.push(
      window.setTimeout(
        () => markStarted("prague"),
        LOGO_PRAGUE_TRIGGER * 1000,
      ),
    );
    for (const route of routes) {
      const settleTime = LOGO_LETTER_SETTLES_REAL[route.groupIdx];
      const flightDuration = route.length / REVEAL_SPEED_PROJ_PER_SEC;
      timeouts.push(
        window.setTimeout(
          () => markStarted(`corridor:${route.id}`),
          settleTime * 1000,
        ),
      );
      timeouts.push(
        window.setTimeout(
          () => markStarted(`city:${route.id}`),
          (settleTime + flightDuration) * 1000,
        ),
      );
    }

    return () => {
      for (const id of timeouts) window.clearTimeout(id);
    };
  }, [active, routes]);

  return (
    <svg
      viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        {/* Single-pass blur on the visible violet arcs. Safari used to
            run a two-pass chain (1.6 + 5) on the CPU per frame of the
            pathLength animation and stuttered. */}
        <filter id="neon-line-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="city-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fce6ff" stopOpacity="1" />
          <stop offset="40%" stopColor="#c149ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#a020f0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="prague-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="35%" stopColor="#f0c9ff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#b829e8" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="country-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4a96" />
          <stop offset="100%" stopColor="#222b6a" />
        </linearGradient>

        {/* Soft-edged white blob used everywhere in the reveal mask —
            solid core fading to transparent over the last
            REVEAL_EDGE_SOFTNESS of its radius. */}
        <radialGradient id="reveal-soft" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset={SOFT_SOLID_STOP} stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* Fog-of-war mask. Black everywhere (= hidden) until a reveal
            shape paints white (= visible) on top. Prague pops first,
            then each route's corridor traces out as the plane flies,
            and each destination blooms when its arc arrives. */}
        <mask
          id="fog-of-war"
          maskUnits="userSpaceOnUse"
          x={viewX}
          y={viewY}
          width={viewW}
          height={viewH}
        >
          <rect x={viewX} y={viewY} width={viewW} height={viewH} fill="black" />

          {revealStage.has("prague") && (
            <motion.circle
              cx={prague.x}
              cy={prague.y}
              fill="url(#reveal-soft)"
              initial={{ r: 0 }}
              animate={{ r: REVEAL_RADIUS_PRAGUE }}
              transition={{ duration: EXPAND_S, ease: "easeOut" }}
            />
          )}

          {routes.map((route) => {
            const dest = cities.find((c) => c.id === route.id);
            if (!dest) return null;
            const flightDuration = route.length / REVEAL_SPEED_PROJ_PER_SEC;
            const corridorActive = revealStage.has(`corridor:${route.id}`);
            const cityActive = revealStage.has(`city:${route.id}`);
            return (
              <Fragment key={route.id}>
                {corridorActive && (
                  <motion.path
                    d={route.d}
                    stroke="white"
                    strokeWidth={REVEAL_CORRIDOR_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: flightDuration, ease: "linear" }}
                  />
                )}
                {cityActive && (
                  <motion.circle
                    cx={dest.x}
                    cy={dest.y}
                    fill="url(#reveal-soft)"
                    initial={{ r: 0 }}
                    animate={{ r: REVEAL_RADIUS_CITY }}
                    transition={{ duration: EXPAND_S, ease: "easeOut" }}
                  />
                )}
              </Fragment>
            );
          })}
        </mask>
      </defs>

      {/* Everything visible is gated on `active`. Pre-mount (SSR + the
          first client render before the Hero mount effect fires) the
          map is blank — no countries, no routes, no dots. This avoids
          a flash of un-masked strokes during hydration, which can
          otherwise briefly reveal the whole sign. Once Hero flips
          active=true, motion's initial states pick up correctly and
          the fog-of-war choreography runs from zero. */}
      {active && (
        <>
          {/* Country silhouettes, hidden under the fog-of-war mask
              until the reveal shapes above paint them in. */}
          <g mask="url(#fog-of-war)">
            {countries.map((c) => (
              <path
                key={c.id}
                d={c.d}
                fill="url(#country-fill)"
                stroke="#5b6dba"
                strokeWidth={0.7}
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* Visible violet arc trajectories — each flies in sync with
              its mask corridor so the white fog-lift tracks the line. */}
          <g filter="url(#neon-line-glow)">
            {routes.map((route) => {
              if (!revealStage.has(`corridor:${route.id}`)) return null;
              const flightDuration = route.length / REVEAL_SPEED_PROJ_PER_SEC;
              return (
                <motion.path
                  key={route.id}
                  d={route.d}
                  stroke="#d172ff"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{
                    pathLength: { duration: flightDuration, ease: "linear" },
                    opacity: { duration: 0.25, ease: "easeOut" },
                  }}
                />
              );
            })}
          </g>

          {/* City dots. Prague fades in when its reveal circle does;
              every destination pops when its arc arrives (same moment
              its mask circle starts expanding). */}
          {cities.map((city) => {
            if (city.origin) {
              if (!revealStage.has("prague")) return null;
              return (
                <motion.g
                  key={city.id}
                  className="prague-pulse"
                  transform={`translate(${city.x} ${city.y})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <circle r={16} fill="url(#prague-glow)" opacity={0.75} />
                  <circle r={3.2} fill="#ffffff" />
                </motion.g>
              );
            }
            if (!revealStage.has(`city:${city.id}`)) return null;
            const route = routeById.get(city.id);
            if (!route) return null;
            return (
              <g key={city.id} transform={`translate(${city.x} ${city.y})`}>
                <motion.g
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <circle r={7.5} fill="url(#city-glow)" opacity={0.7} />
                  <circle r={2.2} fill="#fce6ff" />
                </motion.g>
              </g>
            );
          })}
        </>
      )}
    </svg>
  );
}
