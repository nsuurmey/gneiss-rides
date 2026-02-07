import { describe, it, expect } from 'vitest';
import { forwardFillGeology } from './forwardFill';
import { EnrichedPoint, GeoUnit } from '../types';

const GEO_A: GeoUnit = {
  formationName: 'Fountain',
  interval: 'Pennsylvanian',
  lithology: 'Sandstone',
  ageColor: '#cc6677',
  lithColor: '#ddcc77',
  ageStart: 323,
  ageEnd: 299,
};

const GEO_B: GeoUnit = {
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

describe('forwardFillGeology', () => {
  it('leaves all-valid data unchanged', () => {
    const input = [pt(0, GEO_A), pt(1, GEO_B)];
    const result = forwardFillGeology(input);
    expect(result[0].geology).toBe(GEO_A);
    expect(result[1].geology).toBe(GEO_B);
  });

  it('forward-fills null gaps with last known geology', () => {
    const input = [pt(0, GEO_A), pt(1, null), pt(2, null), pt(3, GEO_B)];
    const result = forwardFillGeology(input);
    expect(result[1].geology).toBe(GEO_A);
    expect(result[2].geology).toBe(GEO_A);
    expect(result[3].geology).toBe(GEO_B);
  });

  it('keeps leading nulls as null (no-data gap)', () => {
    const input = [pt(0, null), pt(1, null), pt(2, GEO_A)];
    const result = forwardFillGeology(input);
    expect(result[0].geology).toBeNull();
    expect(result[1].geology).toBeNull();
    expect(result[2].geology).toBe(GEO_A);
  });

  it('handles all-null input gracefully', () => {
    const input = [pt(0, null), pt(1, null)];
    const result = forwardFillGeology(input);
    expect(result.every((p) => p.geology === null)).toBe(true);
  });

  it('does not mutate original points', () => {
    const input = [pt(0, GEO_A), pt(1, null)];
    forwardFillGeology(input);
    expect(input[1].geology).toBeNull();
  });
});
