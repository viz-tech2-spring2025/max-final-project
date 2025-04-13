import React, { useState, useEffect } from "react";
import Globe from "react-globe.gl";

const OzoneGlobe = () => {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetch("/ozone_data.geojson")
      .then(response => response.json())
      .then(data => {
        if (data.type !== "FeatureCollection") {
          throw new Error("GeoJSON data must be a FeatureCollection");
        }
        const points = data.features
          .map(feature => {
            if (feature.geometry.type !== "Point") return null;
            const [lng, lat] = feature.geometry.coordinates;
            return { lat, lng, value: feature.properties.value };
          })
          .filter(p => p !== null);
        setMarkers(points);
      })
      .catch(error => console.error("Error loading GeoJSON:", error));
  }, []);

  const getPointColor = d => {
    const minOzone = 0;
    const maxOzone = 350;
    const val = d.value;
    const intensity = Math.round(
      Math.min(255, Math.max(0, ((val - minOzone) / (maxOzone - minOzone)) * 255))
    );
    return `rgba(${intensity}, 50, ${255 - intensity}, 0.8)`;
  };

  const getPointRadius = d => 0.4;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        // backgroundColor: "white"
      }}
    >
      <div style={{ width: "80vw", height: "80vh" }}>
        <Globe
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          // backgroundImageUrl="" 
          pointsData={markers}
          pointLat="lat"
          pointLng="lng"
          pointColor={getPointColor}
          pointRadius={getPointRadius}
          pointAltitude={() => 0.01}
          enablePointerInteraction={true}
        />
      </div>
    </div>
  );
};

export default OzoneGlobe;
