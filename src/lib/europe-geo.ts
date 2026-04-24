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

// Group assignment: destinations sorted by Euclidean distance from
// Prague (in projected space). The group count matches the six
// letter-settle moments exported from Logo.tsx — first group lights on
// tečka settle, last on the z-burst crescendo.
const GROUP_SIZES = [3, 3, 3, 3, 3, 2]; // sums to 17

function groupIndexFor(sortedIdx: number): number {
  let cum = 0;
  for (let g = 0; g < GROUP_SIZES.length; g++) {
    cum += GROUP_SIZES[g];
    if (sortedIdx < cum) return g;
  }
  return GROUP_SIZES.length - 1;
}

// Sorted once at build time (server-only module).
const destinationsByDistance = PROJECTED_CITIES
  .filter((c) => !c.origin)
  .slice()
  .sort((a, b) => {
    const dA = Math.hypot(a.x - PRAGUE.x, a.y - PRAGUE.y);
    const dB = Math.hypot(b.x - PRAGUE.x, b.y - PRAGUE.y);
    return dA - dB;
  });

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
// airline-trajectory silhouette.
export type Route = {
  id: string;
  d: string;
  length: number;   // bezier arc length in PROJ units (for flight timing)
  groupIdx: number; // 0..5, which letter-settle triggers this route
};

export const ROUTES: Route[] = destinationsByDistance.map((c, idx) => {
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
    d,
    length,
    groupIdx: groupIndexFor(idx),
  };
});

// Globe metadata for rendering the sphere (ocean, atmospheric halo, limb).
export type GlobeShape = { cx: number; cy: number; r: number };
export const GLOBE: GlobeShape = {
  cx: GLOBE_CX,
  cy: GLOBE_CY,
  r: GLOBE_R,
};
