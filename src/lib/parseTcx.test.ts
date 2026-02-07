import { describe, it, expect } from 'vitest';
import { parseTcx } from './parseTcx';

const MINIMAL_TCX = `<?xml version="1.0"?>
<TrainingCenterDatabase>
  <Activities><Activity><Lap><Track>
    <Trackpoint>
      <Time>2024-01-01T00:00:00Z</Time>
      <Position>
        <LatitudeDegrees>40.0</LatitudeDegrees>
        <LongitudeDegrees>-105.0</LongitudeDegrees>
      </Position>
      <AltitudeMeters>1600</AltitudeMeters>
    </Trackpoint>
    <Trackpoint>
      <Time>2024-01-01T00:01:00Z</Time>
      <Position>
        <LatitudeDegrees>40.001</LatitudeDegrees>
        <LongitudeDegrees>-105.001</LongitudeDegrees>
      </Position>
      <AltitudeMeters>1610</AltitudeMeters>
    </Trackpoint>
  </Track></Lap></Activity></Activities>
</TrainingCenterDatabase>`;

describe('parseTcx', () => {
  it('parses valid TCX into TrackPoint array', () => {
    const points = parseTcx(MINIMAL_TCX);
    expect(points).toHaveLength(2);
    expect(points[0].lat).toBe(40.0);
    expect(points[0].lon).toBe(-105.0);
    expect(points[0].elevation).toBe(1600);
    expect(points[0].distance).toBe(0);
    expect(points[1].distance).toBeGreaterThan(0);
  });

  it('throws on empty XML', () => {
    expect(() => parseTcx('<root></root>')).toThrow('no trackpoints found');
  });

  it('throws on invalid XML', () => {
    expect(() => parseTcx('not xml at all <<<')).toThrow('XML parse error');
  });

  it('skips trackpoints without GPS coordinates', () => {
    const tcx = `<?xml version="1.0"?>
    <TrainingCenterDatabase>
      <Activities><Activity><Lap><Track>
        <Trackpoint><Time>2024-01-01T00:00:00Z</Time></Trackpoint>
        <Trackpoint>
          <Time>2024-01-01T00:01:00Z</Time>
          <Position>
            <LatitudeDegrees>40.0</LatitudeDegrees>
            <LongitudeDegrees>-105.0</LongitudeDegrees>
          </Position>
        </Trackpoint>
      </Track></Lap></Activity></Activities>
    </TrainingCenterDatabase>`;
    const points = parseTcx(tcx);
    expect(points).toHaveLength(1);
  });
});
