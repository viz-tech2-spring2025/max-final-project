import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

const ChoroplethMap = ({ dataByYear }) => {
  if (!dataByYear) {
    throw new Error("dataByYear prop is undefined or null. Please verify that aggregatedData.json is correctly imported and passed.");
  }

  // extract available years (assumed to be continuous, e.g., 1991 to 2012) and sort them.
  const availableYears = Object.keys(dataByYear).sort();
  // use the first available year as the default.
  const [year, setYear] = useState(availableYears[0]);
  const svgRef = useRef();
  const tooltipRef = useRef(null);

  // Conversion function: Convert a 5-digit FIPS code (as a string) to a 6-digit key by repeating the second character.
  // For example: "01001" becomes "011001", "04001" becomes "044001".
  // TODO: explore better strategies for this, probably need to just consolidate this in python. There has to be a better way to do this lol
  // maybe explore other sources that match the data?? would be much easier.
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

    svg.selectAll("*").remove();

    // Load US counties TopoJSON from the CDN.
    // NOTE: this is where the different is in the FIPS codes. Another potential solution could be to explore other sources where the FIPS codes match?
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
      .then(us => {
        // Convert TopoJSON to GeoJSON for counties.
        const counties = feature(us, us.objects.counties).features;
        const currentData = dataByYear[year] || {};
        const values = Object.values(currentData);
        const minValue = values.length > 0 ? d3.min(values) : 0;
        const maxValue = values.length > 0 ? d3.max(values) : 0;

        const colorScale = d3.scaleLinear()
          .domain([minValue, maxValue])
          .range(["#FFF389", "#FE7B38"]);

        svg.selectAll("path")
          .data(counties)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            // converts d.id (5-digit FIPS) to your expected 6-digit key.
            // TODO: explore better strategies for this, probably need to just adjust this in python. There has to be a better way to do this lol.
            const convertedFips = convertFips(d.id);
            const value = currentData[convertedFips];
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
      <h1 className='landing-title'>A Growing Concern</h1>
      <p className="landing-subtitle">Across the US, diagnosis rates continue to grow</p>
      <svg ref={svgRef}></svg>
      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <label htmlFor="year-range" style={{ marginRight: "0.5rem" }}>Select Year:</label>
        <input
          type="range"
          id="year-range"
          min={availableYears[0]}
          max={availableYears[availableYears.length - 1]}
          value={year}
          onChange={handleYearChange}
          step="1"
        />
        <span style={{ marginLeft: "0.5rem" }}>{year}</span>
      </div>
    </div>
  );
};

export default ChoroplethMap;
