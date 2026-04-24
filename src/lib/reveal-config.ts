/**
 * Central reveal-choreography constants shared by the server-side
 * geometry module (europe-geo.ts) and the client EuropeMap component.
 * Kept out of europe-geo.ts because that module is server-only; this
 * file has no side effects so either side can import it.
 *
 * Map animation — ~6 s total:
 *   0              → Prague glow dot + Czechia lights up
 *   INITIAL_DELAY  → 1st plane leaves Prague (nearest city)
 *   +STAGGER       → next plane; 17 planes total spaced by STAGGER
 *   flight time     = bezier arc length / SPEED   (variable per plane)
 *   on arrival      → the country containing that city lights up (or
 *                     pulses if already lit), arc fades out over
 *                     ARC_FADE_OUT_MS then unmounts.
 */

export const INITIAL_DELAY_MS = 400;        // wait after mount before 1st plane
export const STAGGER_MS = 180;              // gap between consecutive plane launches
export const REVEAL_SPEED_PROJ_PER_SEC = 117; // plane speed in SVG user units (slow — ~3× slower than pure sprint)
export const COUNTRY_REVEAL_MS = 400;       // dim → full opacity on arrival
export const COUNTRY_PULSE_MS = 500;        // post-reveal glow pulse duration
export const ARC_HOLD_MS = 2000;            // arc stays fully visible after landing
export const ARC_FADE_OUT_MS = 1500;        // then fades slowly to nothing
export const COUNTRY_PRE_OPACITY = 0.15;    // visibility of dim (pre-reveal) countries
export const ARC_LIFT_RATIO = 0.2;          // bezier control point lift = 20% of chord
