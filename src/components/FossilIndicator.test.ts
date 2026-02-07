import { describe, it, expect } from 'vitest';
import { computeFossilDensity } from './FossilIndicator';
import { EnrichedPoint, GeoUnit } from '../types';

const GEO_A: GeoUnit = {
  unitId: 1001,
  formationName: 'Fountain',
  interval: 'Pennsylvanian',
  lithology: 'Sandstone',
  ageColor: '#cc6677',
  lithColor: '#ddcc77',
  ageStart: 323,
  ageEnd: 299,
};

const GEO_B: GeoUnit = {
  unitId: 1002,
  formationName: 'Lyons',
  interval: 'Permian',
  lithology: 'Sandstone',
  ageColor: '#882255',
  lithColor: '#ddcc77',
  ageStart: 299,
  ageEnd: 252,
};

function pt(distance: number, geology: GeoUnit | null): EnrichedPoint {
  return { lat: 40, lon: -105, elevation: 1600, time: '', distance, geology };
}

describe('computeFossilDensity', () => {
  it('returns entries for formations with enough occurrences', () => {
    const points = [pt(0, GEO_A), pt(1, GEO_A), pt(2, GEO_B)];
    const counts = new Map([
      ['Fountain', 5],
      ['Lyons', 3],
    ]);
    const result = computeFossilDensity(points, counts);
    expect(result).toHaveLength(2);
    expect(result[0].distance).toBe(0);
    expect(result[0].count).toBe(5);
    expect(result[1].distance).toBe(2);
    expect(result[1].count).toBe(3);
  });

  it('skips formations below the density threshold', () => {
    const points = [pt(0, GEO_A), pt(1, GEO_B)];
    const counts = new Map([
      ['Fountain', 0],
      ['Lyons', 2],
    ]);
    const result = computeFossilDensity(points, counts);
    expect(result).toHaveLength(1);
    expect(result[0].distance).toBe(1);
  });

  it('skips points with null geology', () => {
    const points = [pt(0, null), pt(1, GEO_A)];
    const counts = new Map([['Fountain', 3]]);
    const result = computeFossilDensity(points, counts);
    expect(result).toHaveLength(1);
  });

  it('returns empty array for empty points', () => {
    expect(computeFossilDensity([], new Map())).toEqual([]);
  });

  it('deduplicates consecutive same-formation segments', () => {
    const points = [pt(0, GEO_A), pt(1, GEO_A), pt(2, GEO_A)];
    const counts = new Map([['Fountain', 10]]);
    const result = computeFossilDensity(points, counts);
    // Only one entry since formation never changes
    expect(result).toHaveLength(1);
  });
});
