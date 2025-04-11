import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

const ChoroplethMap = ({ dataByYear }) => {

  const availableYears = Object.keys(dataByYear).sort();
  const [year, setYear] = useState(availableYears[0]);
  const svgRef = useRef();

  // Conversion function: convert standard 5-digit FIPS to aggregated key.
  // Pattern: For a code "ABCCC", return "ABBCCC" (repeat the second digit).
  // TODO: this is kind of broken, only works for the existing 6 digit FIPS (CA, UT, CO, AK, AL, CT)
  const convertFips = (fips) => {
    if (fips && fips.length === 5) {
      return fips[0] + fips[1] + fips[1] + fips.substring(2);
    }
    return fips;
  };

  useEffect(() => {
    console.log("Rendering map for year:", year);
    const svg = d3.select(svgRef.current);
    const width = 960;
    const height = 600;
    svg.attr("width", width).attr("height", height);

    // define path generator
    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(1200);
    const path = d3.geoPath().projection(projection);

    // clear elements
    svg.selectAll("*").remove();

    // create tooltips here
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "5px 10px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("color", "#000")
      .style("font-size", "12px");

    // load US counties TopoJSON from the CDN.
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
      .then(us => {
        //convert TopoJSON to GeoJSON for counties.
        const counties = feature(us, us.objects.counties).features;
        const currentData = dataByYear[year] || {};
        const values = Object.values(currentData);
        const minValue = values.length > 0 ? d3.min(values) : 0;
        const maxValue = values.length > 0 ? d3.max(values) : 0;

        // create color scale 
        const colorScale = d3.scaleLinear()
          .domain([minValue, maxValue])
          .range(["#FFF389", "#FE7B38"]);

        // draw counties
        svg.selectAll("path")
          .data(counties)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            // get the county FIPS code from topojson and convert it.
            // TODO either optimize this for the 6 -> 7 digit transition or standarize the data
            const countyFIPS = convertFips(d.id);
            const value = currentData[countyFIPS];
            return value !== undefined ? colorScale(value) : "#ccc";
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("stroke", "black")
              .attr("stroke-width", 2);
            const countyFIPS = convertFips(d.id);
            const value = currentData[countyFIPS];
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
              `<strong>FIPS:</strong> ${countyFIPS}<br/><strong>Value:</strong> ${value !== undefined ? value : "N/A"}`
            )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
          })
          .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("stroke", "#fff")
              .attr("stroke-width", 0.5);
            tooltip.transition().duration(500).style("opacity", 0);
          });
      })
      .catch(error => {
        console.error("Error loading county boundaries:", error);
      });

    // remove tooltips
    return () => {
      tooltip.remove();
    };
  }, [year, dataByYear]);

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  return (
    <div style={{ textAlign: "center", margin: "2rem auto" }}>
      <h2>County-Level Skin Cancer Diagnosis (Choropleth)</h2>
      <svg ref={svgRef}></svg>
      <div style={{ marginTop: "1rem" }}>
        <label htmlFor="year-select" style={{ marginRight: "0.5rem" }}>Select Year:</label>
        <select id="year-select" value={year} onChange={handleYearChange}>
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ChoroplethMap;
