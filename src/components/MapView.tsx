import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EnrichedPoint, ColorMode, getGeoColor } from '../types';
import { ActivePointStore, useActivePoint, useSetActivePoint } from '../hooks/useActivePoint';

interface Props {
  points: EnrichedPoint[];
  colorMode: ColorMode;
  opacity: number; // 0–1
  activePointStore: ActivePointStore;
}

/** Return the ride bounding box padded by a percentage on each side. */
export function getRideBounds(
  points: EnrichedPoint[],
  bufferPct = 0.1,
): L.LatLngBoundsExpression {
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latPad = (maxLat - minLat) * bufferPct;
  const lonPad = (maxLon - minLon) * bufferPct;
  return [
    [minLat - latPad, minLon - lonPad],
    [maxLat + latPad, maxLon + lonPad],
  ];
}

export default function MapView({ points, colorMode, opacity, activePointStore }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const linesRef = useRef<L.Polyline[]>([]);
  const ghostMarkerRef = useRef<L.CircleMarker | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const setActivePoint = useSetActivePoint(activePointStore);
  const activeIdx = useActivePoint(activePointStore);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Use Canvas renderer so polylines render onto a <canvas> element
    // that html2canvas can capture (SVG overlays are not captured).
    const renderer = L.canvas();
    canvasRendererRef.current = renderer;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      renderer,
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

    // Draw colored segments with hover events for map-to-graph sync (task 25)
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const color = getGeoColor(curr.geology, colorMode);
      const segIdx = i;

      const line = L.polyline(
        [
          [prev.lat, prev.lon],
          [curr.lat, curr.lon],
        ],
        { color, weight: 4, opacity },
      )
        .on('mouseover', () => setActivePoint(segIdx))
        .on('mouseout', () => setActivePoint(null))
        .addTo(map);
      linesRef.current.push(line);
    }

    // Fit bounds with 10% buffer
    const bounds = getRideBounds(points, 0.1);
    map.fitBounds(bounds);
  }, [points, colorMode, opacity, setActivePoint]);

  // Ghost marker: show/hide based on activeIdx from GeoProfile hover (task 24)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activeIdx != null && activeIdx >= 0 && activeIdx < points.length) {
      const p = points[activeIdx];
      if (!ghostMarkerRef.current) {
        ghostMarkerRef.current = L.circleMarker([p.lat, p.lon], {
          radius: 7,
          color: '#ffffff',
          fillColor: '#10b981',
          fillOpacity: 0.9,
          weight: 2,
          renderer: canvasRendererRef.current ?? undefined,
        }).addTo(map);
      } else {
        ghostMarkerRef.current.setLatLng([p.lat, p.lon]);
      }
    } else {
      if (ghostMarkerRef.current) {
        map.removeLayer(ghostMarkerRef.current);
        ghostMarkerRef.current = null;
      }
    }
  }, [activeIdx, points]);

  return <div ref={containerRef} className="w-full h-full min-h-[300px]" />;
}
