import { TrackPoint } from '../types';
import { haversine } from './haversine';

/**
 * Parse a GPX XML string into an array of TrackPoints with cumulative distance.
 * Supports both <trkpt> (tracks) and <rtept> (routes).
 */
export function parseGpx(xml: string): TrackPoint[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');

  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error('Invalid GPX file: XML parse error');
  }

  // Try track points first, then route points
  let wpts = doc.getElementsByTagName('trkpt');
  if (wpts.length === 0) {
    wpts = doc.getElementsByTagName('rtept');
  }
  if (wpts.length === 0) {
    throw new Error('Invalid GPX file: no track or route points found');
  }

  const points: TrackPoint[] = [];
  let cumDistance = 0;

  for (let i = 0; i < wpts.length; i++) {
    const pt = wpts[i];
    const lat = parseFloat(pt.getAttribute('lat') ?? '0');
    const lon = parseFloat(pt.getAttribute('lon') ?? '0');

    if (lat === 0 && lon === 0) continue;
    if (!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180)
      continue;

    const eleEl = pt.getElementsByTagName('ele')[0];
    const timeEl = pt.getElementsByTagName('time')[0];

    const elevation = eleEl ? parseFloat(eleEl.textContent ?? '0') : 0;
    const time = timeEl?.textContent ?? '';

    if (points.length > 0) {
      const prev = points[points.length - 1];
      cumDistance += haversine(prev.lat, prev.lon, lat, lon);
    }

    points.push({ lat, lon, elevation, time, distance: cumDistance });
  }

  if (points.length === 0) {
    throw new Error('Invalid GPX file: no GPS data found');
  }

  return points;
}
