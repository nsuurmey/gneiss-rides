import { EnrichedPoint } from '../types';

/**
 * Forward-fill geology data using zero-order hold.
 * Null geology values are replaced with the most recent non-null value.
 * Leading nulls (before any valid data) remain null (transparent gap).
 */
export function forwardFillGeology(points: EnrichedPoint[]): EnrichedPoint[] {
  let lastGeo: EnrichedPoint['geology'] = null;

  return points.map((p) => {
    if (p.geology !== null) {
      lastGeo = p.geology;
      return p;
    }
    // Leading nulls stay null (task 28: transparent until first valid data)
    if (lastGeo === null) return p;
    // Zero-order hold: carry forward
    return { ...p, geology: lastGeo };
  });
}
