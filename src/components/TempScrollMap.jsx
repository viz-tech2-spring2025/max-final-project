import "mapbox-gl/dist/mapbox-gl.css";
import "./TempScrollMap.css";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as THREE from "three";
import { useInView } from "react-intersection-observer";

mapboxgl.accessToken = "pk.eyJ1Ijoic3BlbmNtYSIsImEiOiJjbTg2a2Z5eHEwNTV4Mmtwd2U3NG1qb2V1In0.8HyzOR5scmIu7aN1fis6Yg";

// camera/scene presets
const SF       = { name: "San Francisco", coords: [-122.4194, 37.7749], zoom: 10, pitch: 60, bearing: -17.6 };
const DENVER   = { name: "Denver",         coords: [-104.9903, 39.7392], zoom: 10, pitch: 60, bearing: -17.6 };
const HONOLULU = { name: "Honolulu",       coords: [-157.8583, 21.3069], zoom: 10, pitch: 60, bearing: -17.6 };

// STATEFP → postal abbr map
const stateAbbr = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC",
  "12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY",
  "22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT",
  "31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH",
  "40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT",
  "50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"
};

const ScrollytellingAnomalies = () => {
  const mapContainerRef = useRef();
  const mapRef          = useRef();
  const currentRef      = useRef(SF.name);
  const textRef         = useRef();

  // Intersection Observer options: trigger when top of element crosses vertical center
  const inViewOptions = {
    rootMargin: "-50% 0px 0px 0px",
    threshold:  0
  };
  const [rSF,   inSF]   = useInView(inViewOptions);
  const [rDEN,  inDEN]  = useInView(inViewOptions);
  const [rHON,  inHON]  = useInView(inViewOptions);

  // Reset scroll on mount
  useEffect(() => {
    if (textRef.current) textRef.current.scrollTop = 0;
  }, []);

  // Initialize Mapbox + layers + tooltip
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style:     "mapbox://styles/mapbox/streets-v11",
      center:    SF.coords,
      zoom:      SF.zoom,
      pitch:     SF.pitch,
      bearing:   SF.bearing,
    });
    mapRef.current = map;

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

    map.on("style.load", () => {
      map.resize();

      // Optional Three.js layer
      const threeLayer = {
        id: "three-layer",
        type: "custom",
        renderingMode: "3d",
        onAdd(map, gl) {
          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
          });
          this.renderer.autoClear = false;
          this.scene  = new THREE.Scene();
          this.camera = new THREE.Camera();
        },
        render(gl, matrix) {
          const m = new THREE.Matrix4().fromArray(matrix);
          this.camera.projectionMatrix = m;
          this.renderer.state.reset();
          this.renderer.render(this.scene, this.camera);
        }
      };
      map.addLayer(threeLayer, "waterway-label");

      // Fetch counties + anomalies
      Promise.all([
        fetch("/data/counties.geojson").then(r => r.json()),
        fetch("/data/anomalies.json").then(r => r.json())
      ]).then(([countiesGeo, anomaliesJson]) => {
        const anomalies = anomaliesJson.data;

        // Join anomaly to feature.properties.value
        const features = countiesGeo.features.map(f => {
          const sfp  = f.properties.STATEFP;
          const cfp  = f.properties.COUNTYFP;
          const abbr = stateAbbr[sfp];
          const key  = `${abbr}-${cfp}`;
          f.properties.value = anomalies[key]?.anomaly ?? 0;
          return f;
        });

        // Compute global min/max
        const values = features.map(f => f.properties.value);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);

        // Add source + extrusion layer
        map.addSource("anomaly-counties", {
          type: "geojson",
          data: { type: "FeatureCollection", features }
        });
        map.addLayer({
          id: "anomaly-extrusions",
          type: "fill-extrusion",
          source: "anomaly-counties",
          paint: {
            "fill-extrusion-height": ["*", ["get","value"], 100],
            "fill-extrusion-base":   0,
            "fill-extrusion-opacity": 0.75,
            "fill-extrusion-color": [
              "interpolate", ["linear"], ["get","value"],
              minVal, "#FFF389",
              maxVal, "#FF7B37"
            ]
          }
        });

        // Tooltip interactions
        map.on("mouseenter", "anomaly-extrusions", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "anomaly-extrusions", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
        map.on("mousemove", "anomaly-extrusions", e => {
          const props = e.features[0].properties;
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<strong>${props.NAME}</strong><br/>Anomaly: ${Number(props.value).toFixed(2)}°F`
            )
            .addTo(map);
        });
      }).catch(console.error);
    });

    return () => map.remove();
  }, []);

  // FlyTo on scroll‐spy changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let target = inSF  ? SF
               : inDEN ? DENVER
               : inHON ? HONOLULU
               : null;
    if (target && target.name !== currentRef.current) {
      map.flyTo({
        center:  target.coords,
        zoom:    target.zoom,
        pitch:   target.pitch,
        bearing: target.bearing,
        speed:   0.5
      });
      currentRef.current = target.name;
    }
  }, [inSF, inDEN, inHON]);

  return (
    <div className="scrollytelling-container">
      <div ref={textRef} className="text-column">

        <section ref={rSF} className="text-section bay-area-start">
          <h1>Bay Area View</h1>
          <p>The west coast experiences a what appears like a relatively small difference from normal in March. However, even a small change in global average temperature can lead to more frequent and intense heat waves, droughts, and floods, as well as changes in precipitation patterns.</p>
        </section>
  
        <section ref={rDEN} className="text-section">
          <h1>Denver</h1>
          <p>Denver experiences the most extreme changes of the three, with upwards of a 7 degree increase from expected values. This, in combonation with the altitude, can make for extreme exposure rates.</p>
        </section>
  
        <section ref={rHON} className="text-section">
          <h1>Hawaiʻi View</h1>
          <p>Hawaii experiences the least  change of the three, but still with at least a degree of change.</p>
        </section>
  
      </div>
      <div className="map-column full-bleed-map">
        <div ref={mapContainerRef} className="map-container" />
      </div>
    </div>
  );
};

export default ScrollytellingAnomalies;
