import React, { useState, useEffect, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { ScatterplotLayer, BitmapLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic3BlbmNtYSIsImEiOiJjbTg2a2Z5eHEwNTV4Mmtwd2U3NG1qb2V1In0.8HyzOR5scmIu7aN1fis6Yg";

// start fully zoomed out
const DEFAULT_VIEW     = { latitude: 0,  longitude: 0, zoom: 0,   pitch: 0, bearing: 0 };
// end zoomed in on Antarctica
const ANTARCTICA_VIEW  = { latitude: -75, longitude: 0, zoom: 2.5, pitch: 0, bearing: 0 };

export default function OzoneGlobeDeck() {
  const [markers, setMarkers]   = useState([]);
  const [viewState, setViewState] = useState(DEFAULT_VIEW);
  const containerRef            = useRef();

  // load points
  useEffect(() => {
    fetch("/data/ozone_data.geojson")
      .then(r => r.json())
      .then(data =>
        setMarkers(
          data.features
            .filter(f => f.geometry.type === "Point")
            .map(f => ({
              position: f.geometry.coordinates,
              value:    f.properties.value
            }))
        )
      )
      .catch(console.error);
  }, []);

  // scroll‐driven interpolation over 2× viewport height
  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;

      // distance from top of wrapper to top of viewport
      const rectTop    = containerRef.current.getBoundingClientRect().top;
      const vh         = window.innerHeight;
      const scrollRange = vh * 2;

      // t = 0 when wrapper top sits at bottom of viewport (rectTop = vh)
      // t = 1 when wrapper top has scrolled past -vh
      let t = (vh - rectTop) / scrollRange;
      t = Math.min(1, Math.max(0, t));

      const lerp = (a, b) => a + t * (b - a);
      setViewState({
        latitude:  lerp(DEFAULT_VIEW.latitude,  ANTARCTICA_VIEW.latitude),
        longitude: lerp(DEFAULT_VIEW.longitude, ANTARCTICA_VIEW.longitude),
        zoom:      lerp(DEFAULT_VIEW.zoom,      ANTARCTICA_VIEW.zoom),
        pitch:     lerp(DEFAULT_VIEW.pitch,     ANTARCTICA_VIEW.pitch),
        bearing:   lerp(DEFAULT_VIEW.bearing,   ANTARCTICA_VIEW.bearing)
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // color & radius helpers
  const getColor  = d => {
    const x = Math.min(1, Math.max(0, d.value / 350));
    const r = Math.round(255 * x), b = 255 - r;
    return [r, 50, b, 200];
  };
  const getRadius = d => 20000 + (d.value / 350) * 50000;

  // layers: TileLayer + ScatterplotLayer
  const layers = [
    new TileLayer({
      id:       "mapbox-tiles",
      data:     `https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      tileSize: 512,
      maxZoom:  19,
      renderSubLayers: props => {
        const {
          tile: { bbox: { west, south, east, north } },
          data, id
        } = props;
        return new BitmapLayer(props, {
          id:     `${id}-bitmap`,
          data:   null,
          image:  data,
          bounds: [west, south, east, north]
        });
      }
    }),
    new ScatterplotLayer({
      id:            "ozone-points",
      data:          markers,
      pickable:      true,
      opacity:       0.8,
      getPosition:   d => d.position,
      getFillColor:  getColor,
      getRadius,
      radiusUnits:   "meters"
    })
  ];

  return (
    <div
      ref={containerRef}
      style={{
        width:    "100%",
        height:   "300vh",
        position: "relative"
      }}
    >
      <DeckGL
        views={[new GlobeView()]}
        viewState={viewState}
        controller={false}
        layers={layers}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
