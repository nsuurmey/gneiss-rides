export interface TrackPoint {
  lat: number;
  lon: number;
  elevation: number; // meters
  time: string; // ISO timestamp
  distance: number; // cumulative, km
}

export interface GeoUnit {
  unitId: number; // Macrostrat unit_id (used for transition detection)
  formationName: string;
  interval: string; // e.g. "Cretaceous"
  lithology: string; // e.g. "Sandstone"
  ageColor: string; // USGS hex
  lithColor: string; // USGS hex
  ageStart: number; // Ma
  ageEnd: number; // Ma
}

export interface EnrichedPoint extends TrackPoint {
  geology: GeoUnit | null;
}

export type ColorMode = 'age' | 'lithology';
export type Units = 'metric' | 'imperial';

export function getGeoColor(geo: GeoUnit | null, mode: ColorMode): string {
  if (!geo) return '#888888';
  return mode === 'age' ? geo.ageColor : geo.lithColor;
}

// Conversion helpers
const KM_TO_MI = 0.621371;
const M_TO_FT = 3.28084;

export function convertDistance(km: number, units: Units): number {
  return units === 'metric' ? km : km * KM_TO_MI;
}

export function convertElevation(m: number, units: Units): number {
  return units === 'metric' ? m : m * M_TO_FT;
}

export function distanceLabel(units: Units): string {
  return units === 'metric' ? 'km' : 'mi';
}

export function elevationLabel(units: Units): string {
  return units === 'metric' ? 'm' : 'ft';
}

// V4: Paleobiology Database types
export type FossilKingdom = 'Vertebrate' | 'Invertebrate' | 'Plant';

export interface FossilOccurrence {
  occurrenceId: number;
  taxonName: string;
  classification: string; // e.g. "Invertebrate | Brachiopod"
  kingdom: FossilKingdom;
  pbdbUrl: string;
}

export interface FossilQuery {
  lngMin: number;
  lngMax: number;
  latMin: number;
  latMax: number;
  minMa: number;
  maxMa: number;
  formation?: string;
  stratGroup?: string;
}
