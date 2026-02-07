import { useEffect, useState } from 'react';
import { FossilOccurrence, FossilKingdom, EnrichedPoint } from '../types';
import { fetchFossils, buildFossilQuery } from '../lib/pbdb';
import { buildFossilImageUrl, buildFossilFallbackUrl } from '../lib/fossilSearch';
import { ActivePointStore, useActivePoint } from '../hooks/useActivePoint';

type KingdomFilter = FossilKingdom | 'All';

interface Props {
  points: EnrichedPoint[];
  activePointStore: ActivePointStore;
  open: boolean;
  onClose: () => void;
}

export default function FossilSidebar({ points, activePointStore, open, onClose }: Props) {
  const activeIdx = useActivePoint(activePointStore);
  const [fossils, setFossils] = useState<FossilOccurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<KingdomFilter>('All');
  const [error, setError] = useState(false);

  // Fetch fossils when hovered point changes
  useEffect(() => {
    if (!open || activeIdx == null || activeIdx < 0 || activeIdx >= points.length) {
      return;
    }

    const p = points[activeIdx];
    if (!p.geology) {
      setFossils([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    const query = buildFossilQuery(
      p.lat,
      p.lon,
      p.geology.ageStart,
      p.geology.ageEnd,
      p.geology.formationName !== 'Unknown' ? p.geology.formationName : undefined,
    );

    fetchFossils(query)
      .then((results) => {
        if (!cancelled) {
          setFossils(results);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setFossils([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, activeIdx, points]);

  if (!open) return null;

  const hoveredGeo =
    activeIdx != null && activeIdx >= 0 && activeIdx < points.length
      ? points[activeIdx].geology
      : null;

  const filtered =
    filter === 'All' ? fossils : fossils.filter((f) => f.kingdom === filter);

  return (
    <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-amber-400">Fossil Finder</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs">
          Close
        </button>
      </div>

      {/* Task 36: Kingdom filter */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-700">
        {(['All', 'Vertebrate', 'Invertebrate', 'Plant'] as KingdomFilter[]).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-2 py-0.5 text-xs rounded ${
              filter === k
                ? 'bg-amber-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {k === 'All' ? 'All' : k + 's'}
          </button>
        ))}
      </div>

      {/* Task 37: Location disclaimer */}
      <p className="px-3 py-1.5 text-[10px] text-gray-500 italic border-b border-gray-700 leading-tight">
        Fossils are known to occur within this formation in this region, not necessarily on this
        exact trail.
      </p>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {hoveredGeo && (
          <p className="text-xs text-gray-400 mb-1">
            {hoveredGeo.interval} &middot; {hoveredGeo.formationName}
          </p>
        )}

        {/* Task 44: Loading skeleton */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-700 rounded w-3/4 mb-1" />
                <div className="h-2 bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Task 45: Error state */}
        {error && !loading && (
          <p className="text-xs text-red-400">Failed to load fossil data. Try hovering again.</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-xs text-gray-500">
            {activeIdx == null ? 'Hover over the map or profile to discover fossils.' : 'No fossil occurrences found for this location.'}
          </p>
        )}

        {/* Taxa list */}
        {!loading &&
          filtered.map((f) => (
            <div key={f.occurrenceId} className="border-b border-gray-700 pb-2 last:border-0">
              <p className="text-xs text-gray-200 font-medium">{f.taxonName}</p>
              <p className="text-[10px] text-gray-500">{f.classification}</p>
              <div className="flex gap-2 mt-1">
                <a
                  href={buildFossilImageUrl(f.taxonName, hoveredGeo?.formationName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-400 hover:text-amber-300"
                >
                  Search Images
                </a>
                <a
                  href={f.pbdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300"
                >
                  PBDB
                </a>
                <a
                  href={buildFossilFallbackUrl(f.taxonName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-gray-500 hover:text-gray-300"
                >
                  Taxon Info
                </a>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
