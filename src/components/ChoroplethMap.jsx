import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ChoroplethMap = () => {
  // state for our geo boundaries, cancer counts, list of years, and current year
  const [geoData, setGeoData]           = useState(null);
  const [cancerData, setCancerData]     = useState(null);
  const [years, setYears]               = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const svgRef = useRef();

  // when the component mounts: grab the map shapes and the cancer data
  useEffect(() => {
    Promise.all([
      fetch('/data/msa.geojson').then(r => r.json()),
      fetch('/data/skin_cancer_msa.json').then(r => r.json())
    ])
    .then(([geo, cancer]) => {
      setGeoData(geo);
      setCancerData(cancer);
      // pull out the unique years so our slider can use them
      const yrs = Array.from(new Set(cancer.map(d => d.year))).sort((a, b) => a - b);
      setYears(yrs);
      setSelectedYear(yrs[0]); // start at the first year
    })
    .catch(err => console.error('Oops, data load error:', err));
  }, []);

  // stick one tooltip div onto the page
  useEffect(() => {
    const tip = d3.select('body')
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

    return () => tip.remove();
  }, []);

  // every time our data or selected year changes, redraw the map
  useEffect(() => {
    if (!geoData || !cancerData || selectedYear == null) return;

    const svg = d3.select(svgRef.current)
                  .attr('width', 960)
                  .attr('height', 600);
    svg.selectAll('*').remove(); // clear out last render

    // set up the Albers USA projection
    const projection = d3.geoAlbersUsa().fitSize([960, 600], geoData);
    const path       = d3.geoPath(projection);

    // narrow our cancer data to just this year
    const thisYear    = cancerData.filter(d => d.year === selectedYear);
    const validData   = thisYear.filter(d => d.msa_code !== 99999);
    const byMsa       = new Map(thisYear.map(d => [d.msa_code, d]));

    // find a nice range for our color scale
    const counts      = validData.map(d => d.count).filter(c => c > 0);
    const minCount    = d3.min(counts) ?? 1;
    const maxCount    = d3.max(counts) ?? 1;

    // log scale from pale yellow up to orange
    const colorScale = d3.scaleLog()
      .domain([minCount, maxCount])
      .range(['#FFF389', '#FF7B37'])
      .interpolate(d3.interpolateRgb)
      .clamp(true);

    const tooltip = d3.select('body .msa-tooltip');

    // draw each shape, color it, and hook up hover behavior
    svg.append('g')
      .selectAll('path')
      .data(geoData.features)
      .join('path')
        .attr('d', path)
        .attr('fill', feat => {
          const code = +feat.properties.geoid;
          const val  = byMsa.get(code)?.count ?? 0;
          return val > 0 ? colorScale(val) : '#FFF389';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', (event, feat) => {
          const code  = +feat.properties.geoid;
          const rec   = byMsa.get(code);
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

  // show a loading message until both files are in
  if (!geoData || !cancerData) {
    return <div>Loading map data…</div>;
  }

  // main render: title, legend bar, the SVG, and a year slider
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', color: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>A Growing Concern</h1>
        <p style={{ margin: '4px 0 16px', opacity: 0.8 }}>
          Skin cancer diagnoses are climbing. With new tech and awareness, what’s keeping the trend upward?
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
          fontSize: '0.9rem',
          color: '#ccc'
        }}
      >
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

      <svg ref={svgRef} />

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
