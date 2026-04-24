import "server-only";
import { feature } from "topojson-client";
import { geoOrthographic, geoPath } from "d3-geo";
import type { Feature, FeatureCollection } from "geojson";
import topo from "world-atlas/countries-50m.json";
import { CITIES } from "./cities";
import { ARC_LIFT_RATIO } from "./reveal-config";

/**
 * European countries to render. Names match the world-atlas v2 dataset
 * (Natural Earth — note "Czechia").
 */
const EUROPE_NAMES = new Set([
  "Andorra", "Austria", "Belgium", "Czechia", "Denmark",
  "France", "Germany", "Iceland", "Ireland",
  "Italy", "Liechtenstein", "Luxembourg", "Monaco",
  "Netherlands", "Norway", "Portugal", "San Marino",
  "Spain", "Sweden", "Switzerland", "United Kingdom", "Vatican",
]);

const allCountries = feature(
  topo as unknown as Parameters<typeof feature>[0],
  // @ts-expect-error — topojson-client types accept named object key
  topo.objects.countries,
) as unknown as FeatureCollection;

const europeFeatures: Feature[] = allCountries.features.filter((f) => {
  const name = (f.properties as { name?: string } | null)?.name;
  return name ? EUROPE_NAMES.has(name) : false;
});

// ── Orthographic globe ────────────────────────────────────────────────────
// True sphere projection: Earth as seen from infinity, rotated so Prague
// sits at the centre of the visible disc. Countries near the limb get
// foreshortened (real curvature, not a CSS frame). Back-hemisphere is
// hidden via `clipAngle(90)`.
//
// Layout: 16:9 viewBox, globe positioned right-of-centre so the headline
// fills the empty left half. Globe radius = 83% of half the viewBox height
// — applies the requested 17% shrink relative to a "fill the frame" sphere.

const PRAGUE_LON = 14.4378;
const PRAGUE_LAT = 50.0755;

export const VIEW_W = 960;
export const VIEW_H = 540; // 16:9
export const VIEW_X = 0;
export const VIEW_Y = 0;

// "Cap" of the sphere visible around Prague — countries within CAP_ANGLE°
// of Prague are drawn (with d3-geo trimming anything beyond the cap edge);
// the sphere itself is *never rendered* (no ocean disc, no atmosphere) —
// the curvature of the country shapes alone sells the globe effect.
const CAP_ANGLE = 28;

// Map size & position. GLOBE_R is the radius of the cap edge in PROJ
// units; bigger = bigger Europe on screen. CX anchors Prague so it sits
// 80 px from the viewport's right edge on a reference 1440×900 —
// symmetric to the text column's 80 px padding on the left. Slice math
// on full 1440×900: scale = 900/540 = 1.667, horizontal crop =
// (1600−1440)/2 = 80 px = 48 vbox units each side.
// Target Prague screen_x = 1440 − 80 = 1360.
// Solving:  vbox_x = (1360 / 1.667) + 48 = 864.
// On wider viewports Prague drifts slightly further right of the frame,
// which is acceptable — no abrupt clip line, full Europe stays visible.
const GLOBE_R = 520;
const GLOBE_CX = 864;
const GLOBE_CY = VIEW_H / 2;

// Scale so a point at the cap's edge (CAP_ANGLE°) lands exactly on the
// projected radius GLOBE_R:  scale * sin(CAP_ANGLE) = GLOBE_R.
const PROJECTION_SCALE = GLOBE_R / Math.sin((CAP_ANGLE * Math.PI) / 180);

const projection = geoOrthographic()
  .rotate([-PRAGUE_LON, -PRAGUE_LAT, 0])
  .clipAngle(CAP_ANGLE)
  .scale(PROJECTION_SCALE)
  .translate([GLOBE_CX, GLOBE_CY]);

const pather = geoPath(projection);

export type CountryPath = {
  id: string;
  name: string;
  d: string;
};

export const COUNTRIES: CountryPath[] = europeFeatures
  .map((f) => {
    const d = pather(f);
    if (!d) return null;
    return {
      id: String(f.id ?? (f.properties as { name?: string } | null)?.name ?? ""),
      name: (f.properties as { name?: string } | null)?.name ?? "",
      d,
    };
  })
  .filter((c): c is CountryPath => c !== null);

export type ProjectedCity = {
  id: string;
  name: string;
  x: number;
  y: number;
  origin?: boolean;
};

export const PROJECTED_CITIES: ProjectedCity[] = CITIES.map((c) => {
  const xy = projection([c.lng, c.lat]);
  if (!xy) throw new Error(`Failed to project ${c.name}`);
  return {
    id: c.id,
    name: c.name,
    x: xy[0],
    y: xy[1],
    origin: c.origin,
  };
});

export const PRAGUE = PROJECTED_CITIES.find((c) => c.origin)!;

// Destinations in a randomised launch order. Build-time Fisher-Yates
// shuffle keeps the sequence stable for a given build (no hydration
// mismatch) but breaks the predictable "centre outward" cadence of a
// distance sort — planes now leave Prague in an unrelated order.
const destinationsShuffled = CITIES
  .filter((c) => !c.origin)
  .map((c) => {
    const projected = PROJECTED_CITIES.find((p) => p.id === c.id)!;
    return { ...c, x: projected.x, y: projected.y };
  });
for (let i = destinationsShuffled.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [destinationsShuffled[i], destinationsShuffled[j]] = [
    destinationsShuffled[j],
    destinationsShuffled[i],
  ];
}

// Arc length approximation for a quadratic bezier — 16 polyline
// samples are plenty for "flight time = length / speed" sizing, we
// don't need pixel-perfect length.
function bezierLength(
  ax: number, ay: number,
  cx: number, cy: number,
  bx: number, by: number,
  samples = 16,
): number {
  let len = 0;
  let px = ax, py = ay;
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const mt = 1 - t;
    const x = mt * mt * ax + 2 * mt * t * cx + t * t * bx;
    const y = mt * mt * ay + 2 * mt * t * cy + t * t * by;
    len += Math.hypot(x - px, y - py);
    px = x; py = y;
  }
  return len;
}

// Quadratic bezier from Prague to a destination, bowed "up" (control
// point above the chord midpoint by ARC_LIFT_RATIO × chord). Always
// upward regardless of direction — gives every flight path the same
// airline-trajectory silhouette. `launchIdx` is the stagger order
// (nearest city = 0, farthest = 16).
export type Route = {
  id: string;          // matches CITIES[].id
  country: string;     // country the plane is landing in (for reveal)
  d: string;           // SVG path for the bezier arc
  length: number;      // bezier arc length in PROJ units (flight time = length / speed)
  launchIdx: number;   // 0..N−1, position in the staggered launch order
};

export const ROUTES: Route[] = destinationsShuffled.map((c, idx) => {
  const ax = PRAGUE.x;
  const ay = PRAGUE.y;
  const bx = c.x;
  const by = c.y;
  const chord = Math.hypot(bx - ax, by - ay);
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const cpy = my - chord * ARC_LIFT_RATIO; // lift control point upward
  const d = `M ${ax.toFixed(2)} ${ay.toFixed(2)} Q ${mx.toFixed(2)} ${cpy.toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)}`;
  const length = bezierLength(ax, ay, mx, cpy, bx, by);
  return {
    id: c.id,
    country: c.country,
    d,
    length,
    launchIdx: idx,
  };
});

// Globe metadata for rendering the sphere (ocean, atmospheric halo, limb).
export type GlobeShape = { cx: number; cy: number; r: number };
export const GLOBE: GlobeShape = {
  cx: GLOBE_CX,
  cy: GLOBE_CY,
  r: GLOBE_R,
};
