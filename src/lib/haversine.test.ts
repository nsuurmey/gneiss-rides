import { describe, it, expect } from 'vitest';
import { haversine } from './haversine';

describe('haversine', () => {
  it('returns 0 for identical points', () => {
    expect(haversine(40, -105, 40, -105)).toBe(0);
  });

  it('calculates distance between Boulder and Denver (~40 km)', () => {
    const dist = haversine(40.015, -105.2705, 39.7392, -104.9903);
    expect(dist).toBeGreaterThan(35);
    expect(dist).toBeLessThan(45);
  });

  it('is symmetric', () => {
    const ab = haversine(0, 0, 1, 1);
    const ba = haversine(1, 1, 0, 0);
    expect(ab).toBeCloseTo(ba, 10);
  });
});
