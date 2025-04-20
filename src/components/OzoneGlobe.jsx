import React, { useState, useEffect } from "react";
import Globe from "react-globe.gl";

const OzoneGlobe = () => {
  // State to hold marker data (each marker will have lat, lng, and ozone value)
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Fetch your GeoJSON file; adjust the URL if necessary
    fetch("src/data/ozone_data.geojson")
      .then(response => response.json())
      .then(data => {
        // Ensure data is a FeatureCollection
        if (data.type !== "FeatureCollection") {
          throw new Error("GeoJSON data must be a FeatureCollection");
        }
        // Transform each feature into an object with { lat, lng, value }
        const points = data.features.map(feature => {
          // Make sure geometry is a Point
          if (feature.geometry.type !== "Point") return null;
          const [lng, lat] = feature.geometry.coordinates;
          return { lat, lng, value: feature.properties.value };
        }).filter(p => p !== null);  // Filter any null entries
        setMarkers(points);
      })
      .catch(error => console.error("Error loading GeoJSON:", error));
  }, []);

  // Define a color function based on ozone value.
  const getPointColor = d => {
    // Adjust min and max values based on your data
    const minOzone = 0;
    const maxOzone = 350;
    const val = d.value;
    // Map the ozone value to a 0-255 range
    const intensity = Math.round(
      Math.min(255, Math.max(0, ((val - minOzone) / (maxOzone - minOzone)) * 255))
    );
    // For example, lower values will show as blueish and higher values as reddish.
    return `rgba(${intensity}, 50, ${255 - intensity}, 0.8)`;
  };

  // Optional: Define a function to set point radius based on ozone value.
  const getPointRadius = d => {
    // For example, use a fixed value or calculate based on d.value:
    return 0.4;
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        // backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor="#0B1A2E"
        pointsData={markers}
        pointLat="lat"
        pointLng="lng"
        pointColor={getPointColor}
        pointRadius={getPointRadius}
        pointAltitude={d => 0.01}
        enablePointerInteraction={true}
        enableRotate={true}
        enableZoom={false} 
      />
    </div>
  );
};

export default OzoneGlobe;
