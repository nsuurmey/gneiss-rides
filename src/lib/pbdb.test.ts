import { describe, it, expect } from 'vitest';
import { buildFossilQuery } from './pbdb';

describe('buildFossilQuery', () => {
  it('creates a bbox around the given lat/lon with default buffer', () => {
    const q = buildFossilQuery(40, -105, 323, 299);
    expect(q.latMin).toBeCloseTo(39.75);
    expect(q.latMax).toBeCloseTo(40.25);
    expect(q.lngMin).toBeCloseTo(-105.25);
    expect(q.lngMax).toBeCloseTo(-104.75);
  });

  it('normalises age range so minMa < maxMa', () => {
    const q = buildFossilQuery(40, -105, 323, 299);
    expect(q.minMa).toBe(299);
    expect(q.maxMa).toBe(323);
  });

  it('includes formation when provided', () => {
    const q = buildFossilQuery(40, -105, 323, 299, 'Fountain');
    expect(q.formation).toBe('Fountain');
  });

  it('omits formation when not provided', () => {
    const q = buildFossilQuery(40, -105, 323, 299);
    expect(q.formation).toBeUndefined();
  });

  it('accepts custom buffer', () => {
    const q = buildFossilQuery(40, -105, 323, 299, undefined, 0.5);
    expect(q.latMin).toBeCloseTo(39.5);
    expect(q.latMax).toBeCloseTo(40.5);
  });
});
