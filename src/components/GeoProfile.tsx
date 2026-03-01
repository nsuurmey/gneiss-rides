import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  EnrichedPoint,
  ColorMode,
  Units,
  getGeoColor,
  convertDistance,
  convertElevation,
  distanceLabel,
  elevationLabel,
} from '../types';
import { ActivePointStore, useActivePoint, useSetActivePoint } from '../hooks/useActivePoint';

interface Props {
  points: EnrichedPoint[];
  colorMode: ColorMode;
  units: Units;
  activePointStore: ActivePointStore;
}

/** Group consecutive points by geology color into continuous runs. */
function buildGeoRuns(
  points: EnrichedPoint[],
  colorMode: ColorMode,
): { startIdx: number; endIdx: number; color: string }[] {
  if (points.length === 0) return [];
  const runs: { startIdx: number; endIdx: number; color: string }[] = [];
  let currentColor = getGeoColor(points[0].geology, colorMode);
  let startIdx = 0;

  for (let i = 1; i < points.length; i++) {
    const c = getGeoColor(points[i].geology, colorMode);
    if (c !== currentColor) {
      runs.push({ startIdx, endIdx: i, color: currentColor });
      currentColor = c;
      startIdx = i;
    }
  }
  runs.push({ startIdx, endIdx: points.length - 1, color: currentColor });
  return runs;
}

export default function GeoProfile({
  points,
  colorMode,
  units,
  activePointStore,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const setActivePoint = useSetActivePoint(activePointStore);
  const activeIdx = useActivePoint(activePointStore);

  // Store scales in refs so the scrubber effect can use them
  const xScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);
  const marginRef = useRef({ top: 20, right: 20, bottom: 40, left: 50 });
  const innerHRef = useRef(0);

  useEffect(() => {
    if (!svgRef.current || points.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth ?? 800;
    const height = 280;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    marginRef.current = margin;
    innerHRef.current = innerH;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(points, (p) => convertDistance(p.distance, units)) ?? 1])
      .range([0, innerW]);
    xScaleRef.current = xScale;

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(points, (p) => convertElevation(p.elevation, units)) ?? 0,
        d3.max(points, (p) => convertElevation(p.elevation, units)) ?? 100,
      ])
      .nice()
      .range([innerH, 0]);

    // Task 27: Continuous polygon rendering for geology bands
    // Each run is a polygon: top edge follows the elevation line, bottom is y=innerH
    const geoRuns = buildGeoRuns(points, colorMode);
    for (const run of geoRuns) {
      // No-data gap handling (task 28): #888888 means null geology — render transparent
      if (run.color === '#888888') continue;

      const slice = points.slice(run.startIdx, run.endIdx + 1);
      const polyPoints: [number, number][] = [];

      // Top edge: follows elevation
      for (const p of slice) {
        polyPoints.push([
          xScale(convertDistance(p.distance, units)),
          yScale(convertElevation(p.elevation, units)),
        ]);
      }
      // Bottom edge: flat at innerH, reversed
      for (let j = slice.length - 1; j >= 0; j--) {
        polyPoints.push([xScale(convertDistance(slice[j].distance, units)), innerH]);
      }

      g.append('polygon')
        .attr('points', polyPoints.map((pt) => pt.join(',')).join(' '))
        .attr('fill', run.color)
        .attr('opacity', 0.3);
    }

    // Elevation line only — no fill so geology bands show true color
    const line = d3
      .line<EnrichedPoint>()
      .x((p) => xScale(convertDistance(p.distance, units)))
      .y((p) => yScale(convertElevation(p.elevation, units)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(points)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.5);

    // Bottom axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .append('text')
      .attr('x', innerW / 2)
      .attr('y', 34)
      .attr('fill', '#9ca3af')
      .attr('text-anchor', 'middle')
      .text(`Distance (${distanceLabel(units)})`);

    // Left axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -40)
      .attr('fill', '#9ca3af')
      .attr('text-anchor', 'middle')
      .text(`Elevation (${elevationLabel(units)})`);

    // Style axis text
    svg.selectAll('.tick text').each(function () {
      d3.select(this).attr('fill', '#9ca3af');
    });
    svg.selectAll('.tick line').attr('stroke', '#4b5563');
    svg.selectAll('.domain').attr('stroke', '#4b5563');

    // Scrubber line (used by both local hover and external activeIdx)
    const scrubLine = g
      .append('line')
      .attr('class', 'scrub-line')
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    // Tooltip hover overlay
    const tooltip = d3.select(tooltipRef.current);
    const bisect = d3.bisector<EnrichedPoint, number>((p) =>
      convertDistance(p.distance, units),
    ).left;

    g.append('rect')
      .attr('width', innerW)
      .attr('height', innerH)
      .attr('fill', 'transparent')
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const dist = xScale.invert(mx);
        const idx = Math.min(bisect(points, dist), points.length - 1);
        const p = points[idx];

        // Notify map via shared store (task 24: graph-to-map)
        setActivePoint(idx);

        scrubLine.attr('x1', mx).attr('x2', mx).attr('opacity', 0.6);

        const elev = convertElevation(p.elevation, units);
        const dVal = convertDistance(p.distance, units);
        let html = `<strong>${dVal.toFixed(1)} ${distanceLabel(units)}</strong><br/>`;
        html += `Elev: ${elev.toFixed(0)} ${elevationLabel(units)}`;
        if (p.geology) {
          html += `<br/><span style="color:${getGeoColor(p.geology, colorMode)}">&#9632;</span> ${p.geology.formationName}`;
          html += `<br/>${p.geology.interval} &middot; ${p.geology.lithology}`;
        }

        tooltip
          .html(html)
          .style('opacity', '1')
          .style('left', `${event.offsetX + 12}px`)
          .style('top', `${event.offsetY - 10}px`);
      })
      .on('mouseleave', () => {
        setActivePoint(null);
        scrubLine.attr('opacity', 0);
        tooltip.style('opacity', '0');
      });
  }, [points, colorMode, units, setActivePoint]);

  // Task 25: Map-to-Graph vertical scrubber — react to external activeIdx changes
  useEffect(() => {
    if (!svgRef.current || !xScaleRef.current) return;
    const svg = d3.select(svgRef.current);
    const scrubLine = svg.select('.scrub-line');
    if (scrubLine.empty()) return;

    if (activeIdx != null && activeIdx >= 0 && activeIdx < points.length) {
      const p = points[activeIdx];
      const xPos = xScaleRef.current(convertDistance(p.distance, units));
      scrubLine.attr('x1', xPos).attr('x2', xPos).attr('opacity', 0.6);
    } else {
      scrubLine.attr('opacity', 0);
    }
  }, [activeIdx, points, units]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full" />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-gray-800/95 text-xs text-gray-200 px-2.5 py-1.5 rounded border border-gray-600 leading-relaxed"
        style={{ opacity: 0, transition: 'opacity 0.15s' }}
      />
    </div>
  );
}
