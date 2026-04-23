"use client";

import { motion } from "motion/react";
import type { CountryPath, GlobeShape, ProjectedCity, Route } from "@/lib/europe-geo";

// Must match SLOW in Logo/Hero — keeps the map reveal in sync with the
// flicker and headline timing.
const SLOW = 1.3;

type Props = {
  countries: CountryPath[];
  cities: ProjectedCity[];
  routes: Route[];
  globe: GlobeShape;
  viewX: number;
  viewY: number;
  viewW: number;
  viewH: number;
  /** When true, dots & lines animate in */
  active: boolean;
};

export function EuropeMap({
  countries,
  cities,
  routes,
  globe,
  viewX,
  viewY,
  viewW,
  viewH,
  active,
}: Props) {
  return (
    <svg
      viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <filter id="neon-line-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b1" />
          <feGaussianBlur stdDeviation="5" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
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

        {/* Country fill — bright top, darker bottom; combined with the
            orthographic projection's foreshortening this gives countries
            a subtle volumetric, "lifted off the page" quality. */}
        <linearGradient id="country-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4a96" />
          <stop offset="100%" stopColor="#222b6a" />
        </linearGradient>
      </defs>

      {/* Country shapes — d3-geo clipAngle has already trimmed paths at
          the cap, so countries near the limb appear properly foreshortened
          and cropped along the sphere boundary. */}
      <g>
        {countries.map((c) => (
          <motion.path
            key={c.id}
            d={c.d}
            fill="url(#country-fill)"
            stroke="#5b6dba"
            strokeWidth={0.7}
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={active ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.9 * SLOW, ease: "easeOut" }}
          />
        ))}
      </g>

      {/* Great-circle routes from Prague — bend with the sphere */}
      <g filter="url(#neon-line-glow)">
        {routes.map((route, i) => (
          <motion.path
            key={route.id}
            d={route.d}
            stroke="#d172ff"
            strokeWidth={1.4}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              active
                ? { pathLength: 1, opacity: 0.9 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{
              pathLength: {
                duration: 0.9 * SLOW,
                ease: "easeInOut",
                delay: (0.15 + i * 0.08) * SLOW,
              },
              opacity: {
                duration: 0.3 * SLOW,
                delay: (0.15 + i * 0.08) * SLOW,
              },
            }}
          />
        ))}
      </g>

      {/* City dots */}
      {cities.map((city, i) => {
        if (city.origin) {
          return (
            <g
              key={city.id}
              className="prague-pulse"
              transform={`translate(${city.x} ${city.y})`}
            >
              <circle r={16} fill="url(#prague-glow)" opacity={active ? 0.75 : 0} />
              <circle r={3.2} fill="#ffffff" opacity={active ? 1 : 0} />
            </g>
          );
        }
        return (
          <motion.g
            key={city.id}
            transform={`translate(${city.x} ${city.y})`}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
            transition={{
              duration: 0.4 * SLOW,
              delay: (0.7 + i * 0.08) * SLOW,
              ease: "easeOut",
            }}
          >
            <circle r={7.5} fill="url(#city-glow)" opacity={0.7} />
            <circle r={2.2} fill="#fce6ff" />
          </motion.g>
        );
      })}
    </svg>
  );
}
