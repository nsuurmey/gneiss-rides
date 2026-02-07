import { EnrichedPoint, GeoUnit, ColorMode, getGeoColor } from '../types';

interface Props {
  points: EnrichedPoint[];
  colorMode: ColorMode;
}

export default function Legend({ points, colorMode }: Props) {
  // Collect unique geologic units by formation name
  const unitMap = new Map<string, GeoUnit>();
  for (const p of points) {
    if (p.geology && !unitMap.has(p.geology.formationName)) {
      unitMap.set(p.geology.formationName, p.geology);
    }
  }

  const units = Array.from(unitMap.values());

  if (units.length === 0) {
    return <p className="text-gray-500 text-sm">No geologic data available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {units.map((u) => (
        <div key={u.formationName} className="flex items-center gap-1.5 text-xs text-gray-300">
          <span
            className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: getGeoColor(u, colorMode) }}
          />
          <span className="font-medium">{u.formationName}</span>
          <span className="text-gray-500">
            {u.interval} &middot; {u.lithology}
          </span>
        </div>
      ))}
    </div>
  );
}
