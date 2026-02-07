import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { EnrichedPoint } from '../types';

interface Props {
  points: EnrichedPoint[];
}

export default function GeoProfile({ points }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || points.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth ?? 800;
    const height = 260;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(points, (p) => p.distance) ?? 1])
      .range([0, innerW]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(points, (p) => p.elevation) ?? 0,
        d3.max(points, (p) => p.elevation) ?? 100,
      ])
      .nice()
      .range([innerH, 0]);

    // Draw geology color bands behind the profile
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const color = curr.geology?.ageColor ?? '#444444';
      g.append('rect')
        .attr('x', xScale(prev.distance))
        .attr('y', 0)
        .attr('width', Math.max(xScale(curr.distance) - xScale(prev.distance), 0.5))
        .attr('height', innerH)
        .attr('fill', color)
        .attr('opacity', 0.3);
    }

    // Elevation area
    const area = d3
      .area<EnrichedPoint>()
      .x((p) => xScale(p.distance))
      .y0(innerH)
      .y1((p) => yScale(p.elevation))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(points)
      .attr('d', area)
      .attr('fill', 'rgba(16, 185, 129, 0.4)')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.5);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .append('text')
      .attr('x', innerW / 2)
      .attr('y', 34)
      .attr('fill', '#9ca3af')
      .attr('text-anchor', 'middle')
      .text('Distance (km)');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -40)
      .attr('fill', '#9ca3af')
      .attr('text-anchor', 'middle')
      .text('Elevation (m)');

    // Style axis text
    svg.selectAll('.tick text').attr('fill', '#9ca3af');
    svg.selectAll('.tick line').attr('stroke', '#4b5563');
    svg.selectAll('.domain').attr('stroke', '#4b5563');
  }, [points]);

  return <svg ref={svgRef} className="w-full" />;
}
