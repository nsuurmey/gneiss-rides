import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EnrichedPoint } from '../types';

interface Props {
  points: EnrichedPoint[];
}

export default function MapView({ points }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    // Initialize map once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear previous overlays
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline) map.removeLayer(layer);
    });

    // Draw colored segments
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const color = curr.geology?.ageColor ?? '#888888';

      L.polyline(
        [
          [prev.lat, prev.lon],
          [curr.lat, curr.lon],
        ],
        { color, weight: 4, opacity: 0.85 },
      ).addTo(map);
    }

    // Fit bounds
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number]));
    map.fitBounds(bounds, { padding: [30, 30] });

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [points]);

  return <div ref={containerRef} className="w-full h-full min-h-[300px]" />;
}
