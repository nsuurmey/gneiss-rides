import { FossilOccurrence, FossilQuery, FossilKingdom } from '../types';

const PBDB_BASE = 'https://pbdb.org/data1.2/occs/list.json';

// Task 43: In-memory cache keyed by formation+bbox to avoid redundant fetches
const cache = new Map<string, FossilOccurrence[]>();

function cacheKey(query: FossilQuery): string {
  return `${query.formation ?? ''}:${query.latMin},${query.latMax},${query.lngMin},${query.lngMax}:${query.minMa}-${query.maxMa}`;
}

function classifyKingdom(phylum: string, classStr: string): FossilKingdom {
  const p = (phylum ?? '').toLowerCase();
  const c = (classStr ?? '').toLowerCase();
  if (
    p === 'chordata' ||
    c.includes('mammalia') ||
    c.includes('reptilia') ||
    c.includes('amphibia') ||
    c.includes('aves') ||
    c.includes('actinopterygii')
  ) {
    return 'Vertebrate';
  }
  if (
    p.includes('tracheo') ||
    p.includes('bryo') ||
    p.includes('anthophyta') ||
    p.includes('coniferophyta') ||
    c.includes('plant')
  ) {
    return 'Plant';
  }
  return 'Invertebrate';
}

/**
 * Query PBDB with spatial, temporal, and optional stratigraphic filters.
 * Returns deduplicated fossil occurrences.
 */
export async function fetchFossils(query: FossilQuery): Promise<FossilOccurrence[]> {
  const key = cacheKey(query);
  const cached = cache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    lngmin: String(query.lngMin),
    lngmax: String(query.lngMax),
    latmin: String(query.latMin),
    latmax: String(query.latMax),
    max_ma: String(query.maxMa),
    min_ma: String(query.minMa),
    show: 'class,coords',
    limit: '200',
  });

  if (query.formation) {
    params.set('strat', query.formation);
  }
  if (query.stratGroup) {
    params.set('stratgroup', query.stratGroup);
  }

  try {
    const res = await fetch(`${PBDB_BASE}?${params}`);
    if (!res.ok) {
      cache.set(key, []);
      return [];
    }

    const data = await res.json();
    const records: unknown[] = data.records ?? [];

    // Deduplicate by taxon name
    const seen = new Set<string>();
    const results: FossilOccurrence[] = [];

    for (const r of records as Record<string, unknown>[]) {
      const taxon = String(r.tna ?? r.idn ?? 'Unknown');
      if (seen.has(taxon)) continue;
      seen.add(taxon);

      const phylum = String(r.phl ?? '');
      const cls = String(r.cll ?? '');

      results.push({
        occurrenceId: Number(r.oid ?? 0),
        taxonName: taxon,
        classification: `${classifyKingdom(phylum, cls)} | ${cls || phylum || 'Unknown'}`,
        kingdom: classifyKingdom(phylum, cls),
        pbdbUrl: `https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${r.tid ?? r.oid ?? 0}`,
      });
    }

    cache.set(key, results);
    return results;
  } catch {
    // Task 45: Graceful error handling — return empty on failure
    cache.set(key, []);
    return [];
  }
}

/** Build a FossilQuery from ride segment bounding box and geology data. */
export function buildFossilQuery(
  lat: number,
  lon: number,
  ageStart: number,
  ageEnd: number,
  formation?: string,
  bufferDeg = 0.25,
): FossilQuery {
  return {
    latMin: lat - bufferDeg,
    latMax: lat + bufferDeg,
    lngMin: lon - bufferDeg,
    lngMax: lon + bufferDeg,
    minMa: Math.min(ageStart, ageEnd),
    maxMa: Math.max(ageStart, ageEnd),
    formation,
  };
}
