import { describe, it, expect } from 'vitest';
import { rideBBox } from './exportImage';

describe('rideBBox', () => {
  const points = [
    { lat: 40.0, lon: -105.3 },
    { lat: 40.1, lon: -105.1 },
    { lat: 40.05, lon: -105.2 },
  ];

  it('computes correct min/max bounds', () => {
    const bbox = rideBBox(points, 0);
    expect(bbox.south).toBeCloseTo(40.0);
    expect(bbox.north).toBeCloseTo(40.1);
    expect(bbox.west).toBeCloseTo(-105.3);
    expect(bbox.east).toBeCloseTo(-105.1);
  });

  it('applies 10% buffer by default', () => {
    const bbox = rideBBox(points);
    const latRange = 40.1 - 40.0;
    const lonRange = -105.1 - -105.3;
    expect(bbox.south).toBeCloseTo(40.0 - latRange * 0.1);
    expect(bbox.north).toBeCloseTo(40.1 + latRange * 0.1);
    expect(bbox.west).toBeCloseTo(-105.3 - lonRange * 0.1);
    expect(bbox.east).toBeCloseTo(-105.1 + lonRange * 0.1);
  });
});
