import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DualChoroplethMap = () => {
  const [geoDataMSA, setGeoDataMSA] = useState(null);
  const [cancerDataMSA, setCancerDataMSA] = useState(null);
  const [geoDataCounty, setGeoDataCounty] = useState(null);
  const [uvIndexDataCounty, setUVIndexDataCounty] = useState(null);

  const svgRefMSA = useRef();
  const svgRefCounty = useRef();
  const tooltipRef = useRef(null);

  // Load MSA + cancer data
  useEffect(() => {
    Promise.all([
      fetch('/data/msa.geojson').then(r => r.json()),
      fetch('/data/skin_cancer_msa.json').then(r => r.json())
    ])
    .then(([geo, cancer]) => {
      setGeoDataMSA(geo);
      setCancerDataMSA(cancer);
    })
    .catch(err => console.error('MSA Data load error:', err));
  }, []);

  // Load county GeoJSON + UV index data
  useEffect(() => {
    Promise.all([
      fetch('/data/counties.geojson').then(r => r.json()),
      fetch('/data/uv-county.json').then(r => r.json())
    ])
    .then(([geo, uvIndex]) => {
      setGeoDataCounty(geo);
      setUVIndexDataCounty(uvIndex);
    })
    .catch(err => console.error('County Data load error:', err));
  }, []);

  // Tooltip setup
  useEffect(() => {
    tooltipRef.current = d3.select('body')
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

    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
      }
    };
  }, []);

  // MSA map for 2006
  useEffect(() => {
    if (!geoDataMSA || !cancerDataMSA) return;

    const svg = d3.select(svgRefMSA.current);
    svg.selectAll('*').remove();

    const projection = d3.geoAlbersUsa().fitSize([480, 600], geoDataMSA);
    const path = d3.geoPath(projection);
    const data2006 = cancerDataMSA.filter(d => d.year === 2006);

    svg.selectAll('path')
      .data(geoDataMSA.features)
      .enter().append('path')
      .attr('d', path)
      .attr('fill', feat => {
        const code = +feat.properties.geoid;
        const rec = data2006.find(d => d.msa_code === code);
        return rec ? '#FF5733' : '#FFF389';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', (event, feat) => {
        const code = +feat.properties.geoid;
        const rec = data2006.find(d => d.msa_code === code);
        const name = rec ? rec.MSA : feat.properties.name;
        const count = rec ? rec.count : 'N/A';
        tooltipRef.current
          .html(`<strong>${name}</strong><br/>Count: ${count}`)
          .style('visibility', 'visible');
      })
      .on('mousemove', (event) => {
        tooltipRef.current
          .style('top', `${event.pageY + 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        tooltipRef.current.style('visibility', 'hidden');
      });
  }, [geoDataMSA, cancerDataMSA]);

  // County map with UV data
  useEffect(() => {
    if (!geoDataCounty || !uvIndexDataCounty) return;

    const svg = d3.select(svgRefCounty.current);
    svg.selectAll('*').remove();

    const projection = d3.geoAlbersUsa().fitSize([480, 600], geoDataCounty);
    const path = d3.geoPath(projection);

    svg.selectAll('path')
      .data(geoDataCounty.features)
      .enter().append('path')
      .attr('d', path)
      .attr('fill', feat => {
        const countyName = feat.properties.NAME;
        const match = uvIndexDataCounty.find(d => d['COUNTY NAME'] === countyName);
        if (!match) return '#ccc';
        const uv = +match.uv_index;
        return d3.interpolateYlOrRd(uv / 5000); // normalize for your data range
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', (event, feat) => {
        const name = feat.properties.NAME;
        const uvIndex = uvIndexDataCounty.find(d => d['COUNTY NAME'] === name)?.uv_index || 'N/A';
        tooltipRef.current
          .html(`<strong>${name}</strong><br/>UV Index: ${uvIndex}`)
          .style('visibility', 'visible');
      })
      .on('mousemove', (event) => {
        tooltipRef.current
          .style('top', `${event.pageY + 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        tooltipRef.current.style('visibility', 'hidden');
      });
  }, [geoDataCounty, uvIndexDataCounty]);

  if (!geoDataMSA || !cancerDataMSA || !geoDataCounty || !uvIndexDataCounty) {
    return <div>Loading map data...</div>;
  }

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: '1', marginRight: '10px' }}>
        <h2>Skin Cancer Diagnosis Rates (2006)</h2>
        <svg ref={svgRefMSA} width={480} height={600} />
      </div>
      <div style={{ flex: '1', marginLeft: '10px' }}>
        <h2>UV Index Data by County</h2>
        <svg ref={svgRefCounty} width={480} height={600} />
      </div>
    </div>
  );
};

export default DualChoroplethMap;
