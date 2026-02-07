import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EnrichedPoint, ColorMode, getGeoColor } from '../types';

interface Props {
  points: EnrichedPoint[];
  colorMode: ColorMode;
  opacity: number; // 0–1
}

export default function MapView({ points, colorMode, opacity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const linesRef = useRef<L.Polyline[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Draw / redraw path when points or colorMode change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || points.length === 0) return;

    // Remove old lines
    for (const line of linesRef.current) map.removeLayer(line);
    linesRef.current = [];

    // Draw colored segments
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const color = getGeoColor(curr.geology, colorMode);

      const line = L.polyline(
        [
          [prev.lat, prev.lon],
          [curr.lat, curr.lon],
        ],
        { color, weight: 4, opacity },
      ).addTo(map);
      linesRef.current.push(line);
    }

    // Fit bounds
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [points, colorMode, opacity]);

  return <div ref={containerRef} className="w-full h-full min-h-[300px]" />;
}
