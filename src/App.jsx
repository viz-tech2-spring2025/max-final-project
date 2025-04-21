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

      { /*<div className="map-section">
        <OzoneGlobe /> 
      </div> */ }

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
