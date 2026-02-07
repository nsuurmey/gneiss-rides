import { TrackPoint } from '../types';

/**
 * Downsample an array of TrackPoints to at most `maxPoints` using
 * uniform index-based sampling. Always keeps the first and last point.
 */
export function downsample(points: TrackPoint[], maxPoints: number): TrackPoint[] {
  if (points.length <= maxPoints) return points;

  const result: TrackPoint[] = [points[0]];
  const step = (points.length - 1) / (maxPoints - 1);

  for (let i = 1; i < maxPoints - 1; i++) {
    result.push(points[Math.round(i * step)]);
  }

  result.push(points[points.length - 1]);
  return result;
}
