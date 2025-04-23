import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './DualChoroplethMap.css';

function Legend({ scale, domain }) {
  if (typeof scale !== 'function') return null;
  const [min, max] = domain;
  return (
    <div className="map-legend">
      <span className="legend-label">Low end</span>
      <div
        className="legend-gradient-bar"
        style={{
          background: `linear-gradient(to right, ${scale(min)}, ${scale(max)})`
        }}
      />
      <span className="legend-label">High end</span>
    </div>
  );
}

export default function DualChoroplethMap() {
  const [geoMSA, setGeoMSA]       = useState(null);
  const [cancerMSA, setCancerMSA] = useState(null);
  const [geoCounty, setGeoCounty] = useState(null);
  const [uvCounty, setUvCounty]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const [cancerScale, setCancerScale]   = useState(null);
  const [cancerDomain, setCancerDomain] = useState([0, 0]);
  const [cancerYear, setCancerYear]     = useState(null);

  const [uvScale, setUvScale]           = useState(null);
  const [uvDomain, setUvDomain]         = useState([0, 0]);

  const svgRefMSA    = useRef();
  const svgRefCounty = useRef();
  const tooltipRef   = useRef();

  // 1) Fetch data
  useEffect(() => {
    async function loadAll() {
      try {
        const [gMSA, cMSA, gCnty, uvC] = await Promise.all([
          fetch('/data/msa.geojson').then(r => r.json()),
          fetch('/data/skin_cancer_msa.json').then(r => r.json()),
          fetch('/data/counties.geojson').then(r => r.json()),
          fetch('/data/uv-county.json').then(r => r.json())
        ]);
        setGeoMSA(gMSA);
        setCancerMSA(cMSA);
        setGeoCounty(gCnty);
        setUvCounty(uvC);
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // 2) Shared tooltip container
  useEffect(() => {
    const tip = d3.select('body')
      .append('div')
      .attr('class', 'map-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('padding', '6px')
      .style('background', 'rgba(255,255,255,0.9)')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('color', '#000')
      .style('visibility', 'hidden')
      .style('z-index', '1000');
    tooltipRef.current = tip;
    return () => tip.remove();
  }, []);

  // 3) Skin cancer map with logarithmic color distribution
  useEffect(() => {
    if (!geoMSA || !cancerMSA) return;

    const displayYear = 2006;
    setCancerYear(displayYear);

    // filter to 2006
    const data2006 = cancerMSA
      .filter(d => +d.year === displayYear)
      .map(d => ({ msa_code: +d.msa_code, count: +d.count, MSA: d.MSA }));

    // pull counts
    const counts       = data2006.map(d => d.count);
    const minCount     = d3.min(counts)   || 0;
    const maxCount     = d3.max(counts)   || 0;
    const positives    = counts.filter(c => c > 0);
    const minPositive  = d3.min(positives) || 1;

    // log scale [minPositive, maxCount] → [0,1]
    const logScale = d3.scaleLog()
      .domain([minPositive, maxCount])
      .clamp(true);

    // colorScale: count → color
    const colorScale = v => {
      if (v < minPositive) return d3.interpolateYlOrRd(0);
      return d3.interpolateYlOrRd(logScale(v));
    };

    setCancerScale(() => colorScale);
    setCancerDomain([minCount, maxCount]);

    // build lookup
    const recordMap = Object.fromEntries(
      data2006.map(d => [ d.msa_code.toString(), d ])
    );

    // draw
    const svg = d3.select(svgRefMSA.current);
    svg.selectAll('*').remove();
    const projection = d3.geoAlbersUsa().fitSize([480, 600], geoMSA);
    const path       = d3.geoPath(projection);

    svg.selectAll('path')
      .data(geoMSA.features)
      .join('path')
        .attr('d', path)
        .attr('fill', feature => {
          const rec   = recordMap[feature.properties.geoid.toString()];
          const value = rec?.count ?? 0;
          return colorScale(value);
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', (event, feature) => {
          const rec = recordMap[feature.properties.geoid.toString()];
          tooltipRef.current
            .html(`<strong>${rec?.MSA || 'N/A'}</strong><br/>Count: ${rec?.count ?? 0}`)
            .style('visibility', 'visible');
        })
        .on('mousemove', event => {
          tooltipRef.current
            .style('top',  `${event.pageY + 10}px`)
            .style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', () => {
          tooltipRef.current.style('visibility', 'hidden');
        });
  }, [geoMSA, cancerMSA]);

  // 4) UV index map (unchanged)
  useEffect(() => {
    if (!geoCounty || !uvCounty) return;
    const svg = d3.select(svgRefCounty.current);
    svg.selectAll('*').remove();
    const projection = d3.geoAlbersUsa().fitSize([480, 600], geoCounty);
    const path       = d3.geoPath(projection);

    const uvVals = uvCounty.map(d => +d.uv_index);
    const minUV  = d3.min(uvVals) || 0;
    const maxUV  = d3.max(uvVals) || 0;
    const scaleU = d3.scaleSequential(d3.interpolateYlOrRd)
                     .domain([minUV, maxUV]);

    setUvScale(() => scaleU);
    setUvDomain([minUV, maxUV]);

    svg.selectAll('path')
      .data(geoCounty.features)
      .join('path')
        .attr('d', path)
        .attr('fill', feature => {
          const rec = uvCounty.find(d => d['COUNTY NAME'] === feature.properties.NAME);
          return rec ? scaleU(+rec.uv_index) : '#eeeeee';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', (event, feature) => {
          const name  = feature.properties.NAME;
          const uvVal = uvCounty.find(d => d['COUNTY NAME'] === name)?.uv_index || 0;
          tooltipRef.current
            .html(`<strong>${name}</strong><br/>UV Index: ${uvVal}`)
            .style('visibility', 'visible');
        })
        .on('mousemove', event => {
          tooltipRef.current
            .style('top',  `${event.pageY + 10}px`)
            .style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', () => {
          tooltipRef.current.style('visibility', 'hidden');
        });
  }, [geoCounty, uvCounty]);

  // 5) Loading/Error
  if (loading) return <div style={{ color: '#fff' }}>Loading map data…</div>;
  if (error)   return <div style={{ color: '#f88' }}>Error loading maps</div>;

  // 6) Render
  return (
    <div className="dual-choropleth-wrapper">
      <div className="map-column">
        <h2>Skin Cancer Diagnosis Rates</h2>
        <Legend scale={cancerScale} domain={cancerDomain} />
        <svg ref={svgRefMSA} width={480} height={600} />
      </div>
      <div className="map-column">
        <h2>UV Index by County</h2>
        <Legend scale={uvScale} domain={uvDomain} />
        <svg ref={svgRefCounty} width={480} height={600} />
      </div>
    </div>
  );
}
