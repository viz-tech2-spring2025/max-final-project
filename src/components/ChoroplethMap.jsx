
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

const ChoroplethMap = ({ dataByYear }) => {
  // catch when data doesn't load
  if (!dataByYear) {
    throw new Error("dataByYear prop is undefined or null. Please verify that aggregatedData.json is imported correctly.");
  }

  // extract the available years from the aggregated data keys and sort them.
  const availableYears = Object.keys(dataByYear).sort();
  // use first year as default for flexibility
  const [year, setYear] = useState(availableYears[0]);
  const svgRef = useRef();
  const tooltipRef = useRef(null);

  // Conversion function: Convert a 5-digit FIPS code (as a string) to a 6-digit key by repeating the second character.
  // For example: "01001" becomes "011001", "04001" becomes "044001".
  const convertFips = (fips) => {
    if (typeof fips !== "string") fips = String(fips);
    if (fips.length === 5) {
      return fips.substring(0, 2) + fips[1] + fips.substring(2);
    }
    return fips;
  };

  // Create a persistent tooltip (once on mount).
  useEffect(() => {
    tooltipRef.current = d3.select("body")
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
    return () => {
      tooltipRef.current.remove();
    };
  }, []);

  useEffect(() => {
    console.log("Rendering map for year:", year);
    const svg = d3.select(svgRef.current);
    const width = 960;
    const height = 600;
    svg.attr("width", width).attr("height", height);

    // Define projection and path generator.
    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(1200);
    const path = d3.geoPath().projection(projection);

    // Clear previous render.
    svg.selectAll("*").remove();

    // Load US counties TopoJSON from the CDN.
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
      .then(us => {
        // Convert TopoJSON to GeoJSON for counties.
        const counties = feature(us, us.objects.counties).features;
        const currentData = dataByYear[year] || {};
        const values = Object.values(currentData);
        const minValue = values.length > 0 ? d3.min(values) : 0;
        const maxValue = values.length > 0 ? d3.max(values) : 0;

        // Create a linear color scale.
        const colorScale = d3.scaleLinear()
          .domain([minValue, maxValue])
          .range(["#FFF389", "#FE7B38"]);

        // Draw each county.
        svg.selectAll("path")
          .data(counties)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            // converts d.id (5-digit FIPS) to your expected 6-digit key.
            const convertedFips = convertFips(d.id);
            const value = currentData[convertedFips];

            // console.log("Original:", d.id, "Converted:", convertedFips, "Value:", value);
            return value !== undefined ? colorScale(value) : "#ccc";
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("stroke", "black")
              .attr("stroke-width", 2);
            const convertedFips = convertFips(d.id);
            const value = currentData[convertedFips];
            tooltipRef.current.transition().duration(200).style("opacity", 0.9);
            tooltipRef.current.html(
              `<strong>FIPS:</strong> ${convertedFips}<br/><strong>Value:</strong> ${value !== undefined ? value : "N/A"}`
            )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
          })
          .on("mousemove", function(event) {
            tooltipRef.current.style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("stroke", "#fff")
              .attr("stroke-width", 0.5);
            tooltipRef.current.transition().duration(500).style("opacity", 0);
          });
      })
      .catch(error => {
        console.error("Error loading county boundaries:", error);
      });
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
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ChoroplethMap;
