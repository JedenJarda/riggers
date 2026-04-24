/**
 * 19 destinations the riggers travel to. Coordinates in WGS84 (lat/lng).
 * Project with the same projection used for the Europe map paths.
 *
 * `country` must match a name in EUROPE_NAMES (europe-geo.ts) — when a
 * plane arrives at a city, the map lights up that whole country.
 */
export type City = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  origin?: boolean;
};

export const CITIES: City[] = [
  { id: "prague",    name: "Praha",             country: "Czechia",        lat: 50.0755, lng: 14.4378, origin: true },
  { id: "wien",      name: "Wien",              country: "Austria",        lat: 48.2082, lng: 16.3738 },
  { id: "berlin",    name: "Berlin",            country: "Germany",        lat: 52.52,   lng: 13.405 },
  { id: "hamburg",   name: "Hamburg",           country: "Germany",        lat: 53.5511, lng: 9.9937 },
  { id: "munich",    name: "München",           country: "Germany",        lat: 48.1351, lng: 11.582 },
  { id: "koln",      name: "Köln",              country: "Germany",        lat: 50.9375, lng: 6.9603 },
  { id: "frankfurt", name: "Frankfurt",         country: "Germany",        lat: 50.1109, lng: 8.6821 },
  { id: "zurich",    name: "Zürich",            country: "Switzerland",    lat: 47.3769, lng: 8.5417 },
  { id: "basel",     name: "Basel",             country: "Switzerland",    lat: 47.5596, lng: 7.5886 },
  { id: "amsterdam", name: "Amsterdam",         country: "Netherlands",    lat: 52.3676, lng: 4.9041 },
  { id: "antwerp",   name: "Antwerpen",         country: "Belgium",        lat: 51.2194, lng: 4.4025 },
  { id: "brussels",  name: "Brussels",          country: "Belgium",        lat: 50.8503, lng: 4.3517 },
  { id: "paris",     name: "Paris",             country: "France",         lat: 48.8566, lng: 2.3522 },
  { id: "london",    name: "London",            country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { id: "milano",    name: "Milano",            country: "Italy",          lat: 45.4642, lng: 9.19 },
  { id: "barcelona", name: "Barcelona",         country: "Spain",          lat: 41.3851, lng: 2.1734 },
  { id: "bilbao",    name: "Bilbao",            country: "Spain",          lat: 43.2630, lng: -2.935 },
  { id: "madrid",    name: "Madrid",            country: "Spain",          lat: 40.4168, lng: -3.7038 },
  { id: "palma",     name: "Palma de Mallorca", country: "Spain",          lat: 39.5696, lng: 2.6502 },
  { id: "oslo",      name: "Oslo",              country: "Norway",         lat: 59.9139, lng: 10.7522 },
];
