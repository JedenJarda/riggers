/**
 * Central reveal-choreography constants shared by the server-side
 * geometry module (europe-geo.ts) and the client EuropeMap component.
 * Kept out of europe-geo.ts because that module is marked server-only;
 * this file carries no side effects so either side can import it.
 *
 * Units are SVG user units (viewBox space) unless noted. Slice scale
 * at a 1440×900 viewport ≈ 1.667, so 10 vbox units ≈ 16.67 CSS pixels.
 */

export const REVEAL_RADIUS_PRAGUE = 15;         // fog lift around Prague
export const REVEAL_CORRIDOR_WIDTH = 30;        // fog-lift band traced by a flying arc
export const REVEAL_RADIUS_CITY = 50;           // fog lift around a destination city
export const REVEAL_EDGE_SOFTNESS = 0.2;        // radial gradient fade band (last 20%)
export const REVEAL_EXPAND_MS = 400;            // circle-expand duration (Prague + cities)
// Arc speed tuned so the shortest flight (≈200 PROJ units from Prague
// to Berlin/Wien) takes ~1 s, and the longest (Madrid, Oslo ≈ 800–900
// units) runs a couple seconds. Group settles are 200–1100 ms apart, so
// flights overlap: a later-launching plane takes off while an earlier
// one is still mid-air.
export const REVEAL_SPEED_PROJ_PER_SEC = 200;
export const ARC_LIFT_RATIO = 0.2;              // bezier control point lift = 20% of chord
