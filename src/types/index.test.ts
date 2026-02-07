import { describe, it, expect } from 'vitest';
import {
  getGeoColor,
  convertDistance,
  convertElevation,
  distanceLabel,
  elevationLabel,
  GeoUnit,
} from './index';

const SAMPLE_GEO: GeoUnit = {
  unitId: 1001,
  formationName: 'Fountain',
  interval: 'Pennsylvanian',
  lithology: 'Sandstone',
  ageColor: '#cc6677',
  lithColor: '#ddcc77',
  ageStart: 323,
  ageEnd: 299,
};

describe('getGeoColor', () => {
  it('returns ageColor for age mode', () => {
    expect(getGeoColor(SAMPLE_GEO, 'age')).toBe('#cc6677');
  });

  it('returns lithColor for lithology mode', () => {
    expect(getGeoColor(SAMPLE_GEO, 'lithology')).toBe('#ddcc77');
  });

  it('returns fallback for null geology', () => {
    expect(getGeoColor(null, 'age')).toBe('#888888');
  });
});

describe('unit conversions', () => {
  it('metric returns identity', () => {
    expect(convertDistance(10, 'metric')).toBe(10);
    expect(convertElevation(100, 'metric')).toBe(100);
  });

  it('imperial converts km to miles', () => {
    expect(convertDistance(1, 'imperial')).toBeCloseTo(0.621371, 4);
  });

  it('imperial converts m to ft', () => {
    expect(convertElevation(1, 'imperial')).toBeCloseTo(3.28084, 4);
  });

  it('returns correct labels', () => {
    expect(distanceLabel('metric')).toBe('km');
    expect(distanceLabel('imperial')).toBe('mi');
    expect(elevationLabel('metric')).toBe('m');
    expect(elevationLabel('imperial')).toBe('ft');
  });
});
