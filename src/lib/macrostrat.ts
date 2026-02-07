import { TrackPoint, GeoUnit, EnrichedPoint } from '../types';
import { downsample } from './downsample';

const API_BASE = 'https://macrostrat.org/api/geologic_units/map';
const MAX_QUERY_POINTS = 200;
const THROTTLE_MS = 50; // delay between requests

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Query Macrostrat for a single coordinate. Returns null if no data. */
async function fetchGeoUnit(lat: number, lon: number): Promise<GeoUnit | null> {
  const url = `${API_BASE}?lat=${lat}&lng=${lon}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const features = data.success?.data ?? [];
  if (features.length === 0) return null;

  const f = features[0];
  return {
    unitId: f.unit_id ?? 0,
    formationName: f.unit_name ?? f.strat_name ?? 'Unknown',
    interval: f.t_int_name ?? f.Tseries ?? 'Unknown',
    lithology: f.lith ?? f.rocktype ?? 'Unknown',
    ageColor: f.t_int_color ?? f.color ?? '#888888',
    lithColor: f.lith_color ?? f.color ?? '#888888',
    ageStart: f.t_int_age ?? f.t_age ?? 0,
    ageEnd: f.b_int_age ?? f.b_age ?? 0,
  };
}

/**
 * Enrich track points with geology data from Macrostrat.
 * Downsamples to MAX_QUERY_POINTS for API calls, then interpolates results
 * back to all original points using nearest-sample mapping.
 */
export async function enrichWithGeology(
  points: TrackPoint[],
  onProgress?: (done: number, total: number) => void,
): Promise<EnrichedPoint[]> {
  const sampled = downsample(points, MAX_QUERY_POINTS);

  // Fetch geology for each sampled point
  const geoResults: (GeoUnit | null)[] = [];
  for (let i = 0; i < sampled.length; i++) {
    const geo = await fetchGeoUnit(sampled[i].lat, sampled[i].lon);
    geoResults.push(geo);
    onProgress?.(i + 1, sampled.length);
    if (i < sampled.length - 1) await sleep(THROTTLE_MS);
  }

  // Map sampled distances to geology results for nearest-lookup
  const sampledDistances = sampled.map((p) => p.distance);

  return points.map((p) => {
    // Find nearest sampled point by distance
    let nearestIdx = 0;
    let nearestDelta = Math.abs(p.distance - sampledDistances[0]);
    for (let j = 1; j < sampledDistances.length; j++) {
      const delta = Math.abs(p.distance - sampledDistances[j]);
      if (delta < nearestDelta) {
        nearestDelta = delta;
        nearestIdx = j;
      }
    }
    return { ...p, geology: geoResults[nearestIdx] };
  });
}
