import { describe, it, expect } from 'vitest';
import { downsample } from './downsample';
import { TrackPoint } from '../types';

function makePoints(n: number): TrackPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    lat: 40 + i * 0.001,
    lon: -105,
    elevation: 1600 + i,
    time: `2024-01-01T00:${String(i).padStart(2, '0')}:00Z`,
    distance: i * 0.1,
  }));
}

describe('downsample', () => {
  it('returns original if fewer than maxPoints', () => {
    const pts = makePoints(5);
    expect(downsample(pts, 10)).toBe(pts);
  });

  it('returns exactly maxPoints items', () => {
    const pts = makePoints(100);
    const result = downsample(pts, 20);
    expect(result).toHaveLength(20);
  });

  it('keeps first and last point', () => {
    const pts = makePoints(50);
    const result = downsample(pts, 10);
    expect(result[0]).toBe(pts[0]);
    expect(result[result.length - 1]).toBe(pts[pts.length - 1]);
  });
});
