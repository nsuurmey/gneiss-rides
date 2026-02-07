import { TrackPoint } from '../types';
import { haversine } from './haversine';

/**
 * Parse a TCX XML string into an array of TrackPoints with cumulative distance.
 * Uses the browser DOMParser for zero-dependency XML handling.
 */
export function parseTcx(xml: string): TrackPoint[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');

  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error('Invalid TCX file: XML parse error');
  }

  const trackpoints = doc.getElementsByTagName('Trackpoint');
  if (trackpoints.length === 0) {
    throw new Error('Invalid TCX file: no trackpoints found');
  }

  const points: TrackPoint[] = [];
  let cumDistance = 0;

  for (let i = 0; i < trackpoints.length; i++) {
    const tp = trackpoints[i];
    const latEl = tp.getElementsByTagName('LatitudeDegrees')[0];
    const lonEl = tp.getElementsByTagName('LongitudeDegrees')[0];
    const eleEl = tp.getElementsByTagName('AltitudeMeters')[0];
    const timeEl = tp.getElementsByTagName('Time')[0];
    const hrEl = tp.getElementsByTagName('Value')[0]; // inside HeartRateBpm

    if (!latEl || !lonEl) continue; // skip points without GPS

    const lat = parseFloat(latEl.textContent ?? '0');
    const lon = parseFloat(lonEl.textContent ?? '0');
    const elevation = eleEl ? parseFloat(eleEl.textContent ?? '0') : 0;
    const time = timeEl?.textContent ?? '';
    const heartRate = hrEl ? parseInt(hrEl.textContent ?? '0', 10) : undefined;

    if (points.length > 0) {
      const prev = points[points.length - 1];
      cumDistance += haversine(prev.lat, prev.lon, lat, lon);
    }

    points.push({ lat, lon, elevation, time, heartRate, distance: cumDistance });
  }

  if (points.length === 0) {
    throw new Error('Invalid TCX file: no GPS data found');
  }

  return points;
}
