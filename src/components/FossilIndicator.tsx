import { useMemo } from 'react';
import { EnrichedPoint } from '../types';

// Task 47: Minimum occurrences to show a fossil icon on a segment
const DENSITY_THRESHOLD = 1;

interface FossilDensity {
  distance: number; // km along ride
  count: number;
}

interface Props {
  points: EnrichedPoint[];
  fossilCounts: Map<string, number>; // formation name → occurrence count
  xScale: (km: number) => number;
  innerH: number;
}

/**
 * Compute which formations along the ride have enough fossil occurrences
 * to warrant an indicator icon.
 */
export function computeFossilDensity(
  points: EnrichedPoint[],
  fossilCounts: Map<string, number>,
): FossilDensity[] {
  const result: FossilDensity[] = [];
  let lastFormation = '';

  for (const p of points) {
    const name = p.geology?.formationName ?? '';
    if (name && name !== lastFormation) {
      const count = fossilCounts.get(name) ?? 0;
      if (count >= DENSITY_THRESHOLD) {
        result.push({ distance: p.distance, count });
      }
      lastFormation = name;
    }
  }

  return result;
}

/**
 * Renders small ammonite-style icons (unicode fossil symbol) on the
 * geo-profile bar at segments with high fossil occurrence density.
 */
export default function FossilIndicator({ points, fossilCounts, xScale, innerH }: Props) {
  const densities = useMemo(
    () => computeFossilDensity(points, fossilCounts),
    [points, fossilCounts],
  );

  if (densities.length === 0) return null;

  return (
    <g className="fossil-indicators">
      {densities.map((d, i) => (
        <text
          key={i}
          x={xScale(d.distance)}
          y={innerH - 4}
          textAnchor="middle"
          fontSize="12"
          fill="#f59e0b"
          opacity={0.8}
          style={{ pointerEvents: 'none' }}
        >
          🦴
        </text>
      ))}
    </g>
  );
}
