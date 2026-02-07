import { describe, it, expect } from 'vitest';
import { buildFossilImageUrl, buildFossilFallbackUrl } from './fossilSearch';

describe('buildFossilImageUrl', () => {
  it('includes taxon name in DuckDuckGo image search URL', () => {
    const url = buildFossilImageUrl('Tyrannosaurus rex');
    expect(url).toContain('duckduckgo.com');
    expect(url).toContain('Tyrannosaurus%20rex');
    expect(url).toContain('fossil%20specimen');
    expect(url).toContain('iax=images');
  });

  it('appends formation name when provided', () => {
    const url = buildFossilImageUrl('Allosaurus', 'Morrison');
    expect(url).toContain('Allosaurus');
    expect(url).toContain('Morrison');
  });
});

describe('buildFossilFallbackUrl', () => {
  it('points to PBDB taxon info page', () => {
    const url = buildFossilFallbackUrl('Triceratops');
    expect(url).toContain('paleobiodb.org');
    expect(url).toContain('Triceratops');
  });
});
