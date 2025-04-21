import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ChoroplethMap = () => {
  const [geoData, setGeoData]           = useState(null);
  const [cancerData, setCancerData]     = useState(null);
  const [years, setYears]               = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const svgRef = useRef();

  // 1) Load GeoJSON & cancer data once
  useEffect(() => {
    Promise.all([
      fetch('/data/msa.geojson').then(r => r.json()),
      fetch('/data/skin_cancer_msa.json').then(r => r.json())
    ])
    .then(([geo, cancer]) => {
      setGeoData(geo);
      setCancerData(cancer);
      const yrs = Array.from(new Set(cancer.map(d => d.year))).sort((a, b) => a - b);
      setYears(yrs);
      setSelectedYear(yrs[0]);
    })
    .catch(err => console.error('Data load error:', err));
  }, []);

  // 2) Create a tooltip DIV on the body
  useEffect(() => {
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'msa-tooltip')
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

    return () => tooltip.remove();
  }, []);

  // 3) Draw/update the map whenever data or year changes
  useEffect(() => {
    if (!geoData || !cancerData || selectedYear == null) return;

    const svg = d3.select(svgRef.current)
                  .attr('width', 960)
                  .attr('height', 600);
    svg.selectAll('*').remove();

    // projection & path
    const projection = d3.geoAlbersUsa().fitSize([960, 600], geoData);
    const path       = d3.geoPath(projection);

    // filter for this year
    const yearData     = cancerData.filter(d => d.year === selectedYear);
    const realYearData = yearData.filter(d => d.msa_code !== 99999);
    const recordByMsa  = new Map(yearData.map(d => [d.msa_code, d]));

    // compute domain based on real MSAs
    const positiveCounts = realYearData.map(d => d.count).filter(c => c > 0);
    const minPos  = d3.min(positiveCounts) ?? 1;
    const maxCount= d3.max(positiveCounts) ?? 1;

    const colorScale = d3.scaleLog()
      .domain([minPos, maxCount])
      .range(['#FFF389', '#FF7B37'])
      .interpolate(d3.interpolateRgb)
      .clamp(true);

    const tooltip = d3.select('body .msa-tooltip');

    svg.append('g')
      .selectAll('path')
      .data(geoData.features)
      .join('path')
        .attr('d', path)
        .attr('fill', feat => {
          const code = +feat.properties.geoid;
          const val  = recordByMsa.get(code)?.count ?? 0;
          return val > 0
            ? colorScale(val)
            : '#FFF389';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', (event, feat) => {
          const code  = +feat.properties.geoid;
          const rec   = recordByMsa.get(code);
          const name  = rec?.MSA || feat.properties.name;
          const count = rec?.count ?? 0;
          tooltip
            .html(`<strong>${name}</strong><br/>Count: ${count}`)
            .style('visibility', 'visible');
        })
        .on('mousemove', (event) => {
          tooltip
            .style('top',  `${event.pageY + 10}px`)
            .style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden');
        });

  }, [geoData, cancerData, selectedYear]);

  // 4) Render slider centered instead of dropdown
  if (!geoData || !cancerData) {
    return <div>Loading map data…</div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', color: '#fff' }}>
      {/* Title & subtitle */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>A Growing Concern</h1>
        <p style={{ margin: '4px 0 16px', opacity: 0.8 }}>
          Across the US, diagnosis rates continue to grow.
        </p>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        fontSize: '0.9rem',
        color: '#ccc'
      }}>
        <span>Low end</span>
        <div
          style={{
            width: 200,
            height: 15,
            margin: '0 8px',
            background: 'linear-gradient(to right, #FFF389, #FF7B37)',
            borderRadius: 5
          }}
        />
        <span>High end</span>
      </div>

      {/* Map */}
      <svg ref={svgRef} />

      {/* Slider */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <label htmlFor="year-range" style={{ marginRight: 8 }}>
          Year:
        </label>
        <input
          type="range"
          id="year-range"
          min={years[0]}
          max={years[years.length - 1]}
          step={1}
          value={selectedYear}
          onChange={e => setSelectedYear(+e.target.value)}
        />
        <span style={{ marginLeft: 12, fontWeight: 'bold' }}>
          {selectedYear}
        </span>
      </div>
    </div>
  );
};

export default ChoroplethMap;
