import React, { useState, useEffect } from 'react';

import LandingSection   from './components/LandingSection';
import ChoroplethMap    from './components/ChoroplethMap';
import SkinCancerInfo   from './components/SkinCancerInfo';
import TypesScroll      from './components/TypesScroll';
import OzoneGlobe       from './components/OzoneGlobe';
import ScrollPeopleVisualization from './components/ScrollPeopleVisualization';

import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import DualChoroplethMap from './components/DualChoroplethMap';
import OzoneGlobeDeck from './components/OzoneGlobeDeck';
import StaticOzoneGlobeDeck from './components/StaticOzoneGlobeDeck';


function App() {
  const [dataByYear, setDataByYear] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch('/data/skin_cancer_msa.json')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(json => {
        setDataByYear(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load skin cancer data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="site-wrapper">
      <LandingSection />

      <div className="app-container">
        {loading ? (
          <div>Loading map data…</div>
        ) : (
          <ChoroplethMap dataByYear={dataByYear} />
        )}
      </div>

      <div className="app-container">
        <SkinCancerInfo />
      </div>

      <div className="app-container">
        <TypesScroll />
      </div>

      <div className="app-container key-factors">
        <h2 className="key-factors-title">What are the key factors?</h2>
        <p className="key-factors-text">
          Skin cancer is primarily an exposure problem. Environmentally speaking, the ozone protects us from the full force of the sun’s UV rays.
        </p>
        <p className="key-factors-text">
          The real problem lies in human behaviour.
        </p>
      </div>

      <div className="map-section">
        <OzoneGlobeDeck />
      </div>
      
      <div className="app-container">
        <div className="app-container static-globe-section">
          <div className="static-globe-text">
          <h2>The Ozone Layer</h2>
          <p>Since the Moteral Protocol in 1987, the ozone layer has experienced considerable levels of repair. The ozone layer is what primarily protects
            us from harmful levels of raditation, but as you can see on the map below, the underlying problem is not with the ozone layer, it suggests
            something deeper. </p>
          </div>
          <StaticOzoneGlobeDeck />
        </div>
      </div>

      <div className="app-container">
        <DualChoroplethMap />
      </div>

      <div className="app-container">
        <ScrollPeopleVisualization />
      </div>



    </div>
  );
}

export default App;
