import { describe, it, expect } from 'vitest';
import { parseGpx } from './parseGpx';

const MINIMAL_GPX = `<?xml version="1.0"?>
<gpx version="1.1">
  <trk><trkseg>
    <trkpt lat="40.0" lon="-105.0">
      <ele>1600</ele>
      <time>2024-01-01T00:00:00Z</time>
    </trkpt>
    <trkpt lat="40.001" lon="-105.001">
      <ele>1610</ele>
      <time>2024-01-01T00:01:00Z</time>
    </trkpt>
  </trkseg></trk>
</gpx>`;

describe('parseGpx', () => {
  it('parses valid GPX into TrackPoint array', () => {
    const points = parseGpx(MINIMAL_GPX);
    expect(points).toHaveLength(2);
    expect(points[0].lat).toBe(40.0);
    expect(points[0].lon).toBe(-105.0);
    expect(points[0].elevation).toBe(1600);
    expect(points[0].distance).toBe(0);
    expect(points[1].distance).toBeGreaterThan(0);
  });

  it('parses route points (<rtept>)', () => {
    const gpx = `<?xml version="1.0"?>
    <gpx version="1.1">
      <rte>
        <rtept lat="40.0" lon="-105.0"><ele>1600</ele></rtept>
        <rtept lat="40.001" lon="-105.001"><ele>1610</ele></rtept>
      </rte>
    </gpx>`;
    const points = parseGpx(gpx);
    expect(points).toHaveLength(2);
  });

  it('throws on empty GPX', () => {
    expect(() => parseGpx('<gpx></gpx>')).toThrow('no track or route points found');
  });

  it('throws on invalid XML', () => {
    expect(() => parseGpx('<<<bad')).toThrow('XML parse error');
  });
});
