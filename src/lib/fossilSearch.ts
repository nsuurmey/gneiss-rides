/**
 * Build a search URL for fossil specimen images.
 * Uses DuckDuckGo image search as a free, no-key-required alternative
 * to Google Custom Search (falls back gracefully if quota exceeded).
 */
export function buildFossilImageUrl(
  taxonName: string,
  formationName?: string,
): string {
  const parts = [taxonName];
  if (formationName) parts.push(formationName);
  parts.push('fossil specimen');
  const query = encodeURIComponent(parts.join(' '));
  return `https://duckduckgo.com/?q=${query}&iax=images&ia=images`;
}

/**
 * Task 46: Fallback URL when primary search is unavailable.
 * Points to PBDB taxon search page.
 */
export function buildFossilFallbackUrl(taxonName: string): string {
  const query = encodeURIComponent(taxonName);
  return `https://paleobiodb.org/classic/basicTaxonInfo?taxon_name=${query}`;
}
