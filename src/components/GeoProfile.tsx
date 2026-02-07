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

interface Props {
  points: EnrichedPoint[];
  colorMode: ColorMode;
  units: Units;
  showHeartRate: boolean;
}

export default function GeoProfile({ points, colorMode, units, showHeartRate }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || points.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth ?? 800;
    const height = 280;
    const margin = { top: 20, right: showHeartRate ? 55 : 20, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(points, (p) => convertDistance(p.distance, units)) ?? 1])
      .range([0, innerW]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(points, (p) => convertElevation(p.elevation, units)) ?? 0,
        d3.max(points, (p) => convertElevation(p.elevation, units)) ?? 100,
      ])
      .nice()
      .range([innerH, 0]);

    // Geology color bands
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const color = getGeoColor(curr.geology, colorMode);
      const x1 = xScale(convertDistance(prev.distance, units));
      const x2 = xScale(convertDistance(curr.distance, units));
      g.append('rect')
        .attr('x', x1)
        .attr('y', 0)
        .attr('width', Math.max(x2 - x1, 0.5))
        .attr('height', innerH)
        .attr('fill', color)
        .attr('opacity', 0.3);
    }

    // Elevation area
    const area = d3
      .area<EnrichedPoint>()
      .x((p) => xScale(convertDistance(p.distance, units)))
      .y0(innerH)
      .y1((p) => yScale(convertElevation(p.elevation, units)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(points)
      .attr('d', area)
      .attr('fill', 'rgba(16, 185, 129, 0.4)')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.5);

    // Heart rate secondary axis
    const hasHR = showHeartRate && points.some((p) => p.heartRate != null);
    if (hasHR) {
      const hrMax = d3.max(points, (p) => p.heartRate ?? 0) ?? 200;
      const hrMin = d3.min(points, (p) => p.heartRate ?? hrMax) ?? 60;
      const hrScale = d3
        .scaleLinear()
        .domain([hrMin, hrMax])
        .nice()
        .range([innerH, 0]);

      const hrLine = d3
        .line<EnrichedPoint>()
        .defined((p) => p.heartRate != null)
        .x((p) => xScale(convertDistance(p.distance, units)))
        .y((p) => hrScale(p.heartRate ?? 0))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(points)
        .attr('d', hrLine)
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.2)
        .attr('opacity', 0.7);

      // Right axis
      const hrAxis = g
        .append('g')
        .attr('transform', `translate(${innerW},0)`)
        .call(d3.axisRight(hrScale).ticks(5));

      hrAxis.selectAll('.tick text').attr('fill', '#ef4444');
      hrAxis.selectAll('.tick line').attr('stroke', '#4b5563');
      hrAxis.select('.domain').attr('stroke', '#4b5563');

      hrAxis
        .append('text')
        .attr('transform', 'rotate(90)')
        .attr('x', innerH / 2)
        .attr('y', -45)
        .attr('fill', '#ef4444')
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .text('Heart Rate (bpm)');
    }

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

    // Style axis text (skip HR axis which is already red)
    svg.selectAll('.tick text').each(function () {
      const el = d3.select(this);
      if (el.attr('fill') !== '#ef4444') el.attr('fill', '#9ca3af');
    });
    svg.selectAll('.tick line').attr('stroke', '#4b5563');
    svg.selectAll('.domain').attr('stroke', '#4b5563');

    // Tooltip hover overlay
    const tooltip = d3.select(tooltipRef.current);
    const bisect = d3.bisector<EnrichedPoint, number>((p) =>
      convertDistance(p.distance, units),
    ).left;

    const hoverLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerH)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    g.append('rect')
      .attr('width', innerW)
      .attr('height', innerH)
      .attr('fill', 'transparent')
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const dist = xScale.invert(mx);
        const idx = Math.min(
          bisect(points, dist),
          points.length - 1,
        );
        const p = points[idx];

        hoverLine.attr('x1', mx).attr('x2', mx).attr('opacity', 0.6);

        const elev = convertElevation(p.elevation, units);
        const dVal = convertDistance(p.distance, units);
        let html = `<strong>${dVal.toFixed(1)} ${distanceLabel(units)}</strong><br/>`;
        html += `Elev: ${elev.toFixed(0)} ${elevationLabel(units)}`;
        if (p.heartRate != null) html += `<br/>HR: ${p.heartRate} bpm`;
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
        hoverLine.attr('opacity', 0);
        tooltip.style('opacity', '0');
      });
  }, [points, colorMode, units, showHeartRate]);

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
