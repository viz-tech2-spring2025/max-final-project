import React, { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { ScatterplotLayer, BitmapLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic3BlbmNtYSIsImEiOiJjbTg2a2Z5eHEwNTV4Mmtwd2U3NG1qb2V1In0.8HyzOR5scmIu7aN1fis6Yg";

// fixed “camera” centered on Antarctica
const ANTARCTICA_VIEW = {
  latitude: -65,
  longitude: 0,
  zoom: 0,
  pitch: 0,
  bearing: 0
};

export default function StaticOzoneGlobeDeck() {
  const [markers, setMarkers] = useState([]);

  // load the same geojson points
  useEffect(() => {
    fetch("/data/ozone_data.geojson")
      .then((r) => r.json())
      .then((data) =>
        setMarkers(
          data.features
            .filter((f) => f.geometry.type === "Point")
            .map((f) => ({
              position: f.geometry.coordinates,
              value: f.properties.value
            }))
        )
      )
      .catch(console.error);
  }, []);

  const getColor = (d) => {
    const x = Math.min(1, Math.max(0, d.value / 350));
    const r = Math.round(255 * x),
      b = 255 - r;
    return [r, 50, b, 200];
  };
  const getRadius = (d) => 20000 + (d.value / 350) * 50000;

  const layers = [
    new TileLayer({
      id: "static-mapbox-tiles",
      data: `https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      tileSize: 512,
      maxZoom: 19,
      renderSubLayers: (props) => {
        const {
          tile: {
            bbox: { west, south, east, north }
          },
          data,
          id
        } = props;
        return new BitmapLayer(props, {
          id: `${id}-bitmap`,
          data: null,
          image: data,
          bounds: [west, south, east, north]
        });
      }
    }),
    new ScatterplotLayer({
      id: "static-ozone-points",
      data: markers,
      pickable: true,
      opacity: 0.8,
      getPosition: (d) => d.position,
      getFillColor: getColor,
      getRadius,
      radiusUnits: "meters"
    })
  ];

  return (
        <div className="static-globe-container">
          {/* inner fixed-size box */}
          <div className="static-globe-box">
            <DeckGL
              views={[new GlobeView()]}
              viewState={ANTARCTICA_VIEW}
              controller={false}
              layers={layers}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      );
}
