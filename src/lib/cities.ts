/**
 * 17 destinations the riggers travel to. Coordinates in WGS84 (lat/lng).
 * Project with the same projection used for the Europe map paths.
 */
export type City = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  origin?: boolean;
};

export const CITIES: City[] = [
  { id: "prague", name: "Praha", lat: 50.0755, lng: 14.4378, origin: true },
  { id: "wien", name: "Wien", lat: 48.2082, lng: 16.3738 },
  { id: "berlin", name: "Berlin", lat: 52.52, lng: 13.405 },
  { id: "hamburg", name: "Hamburg", lat: 53.5511, lng: 9.9937 },
  { id: "munich", name: "München", lat: 48.1351, lng: 11.582 },
  { id: "koln", name: "Köln", lat: 50.9375, lng: 6.9603 },
  { id: "frankfurt", name: "Frankfurt", lat: 50.1109, lng: 8.6821 },
  { id: "zurich", name: "Zürich", lat: 47.3769, lng: 8.5417 },
  { id: "amsterdam", name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  { id: "antwerp", name: "Antwerpen", lat: 51.2194, lng: 4.4025 },
  { id: "brussels", name: "Brussels", lat: 50.8503, lng: 4.3517 },
  { id: "paris", name: "Paris", lat: 48.8566, lng: 2.3522 },
  { id: "london", name: "London", lat: 51.5074, lng: -0.1278 },
  { id: "milano", name: "Milano", lat: 45.4642, lng: 9.19 },
  { id: "barcelona", name: "Barcelona", lat: 41.3851, lng: 2.1734 },
  { id: "madrid", name: "Madrid", lat: 40.4168, lng: -3.7038 },
  { id: "palma", name: "Palma de Mallorca", lat: 39.5696, lng: 2.6502 },
  { id: "oslo", name: "Oslo", lat: 59.9139, lng: 10.7522 },
];
