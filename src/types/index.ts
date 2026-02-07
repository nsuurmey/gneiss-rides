export interface TrackPoint {
  lat: number;
  lon: number;
  elevation: number; // meters
  time: string; // ISO timestamp
  heartRate?: number;
  distance: number; // cumulative, km
}

export interface GeoUnit {
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
