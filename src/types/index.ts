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
