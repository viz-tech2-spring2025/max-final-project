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
        <h1>What are the key factors?</h1>
        <p className="key-factors-text">
          People point to a variety of factors when it comes to skin cancer, but it really boils down to an exposure problem.
          There are 3 primary factors we will explore: <b><br/><br/>The ozone layer <br/> How rising temperatures might effect us<br/> How we behave in the sun</b> 
        </p>
      </div>

      <div className="map-section">
        <OzoneGlobeDeck />
      </div>
      
      <div className="app-container">
      <h1>The Ozone Layer</h1>
        <div className="app-container static-globe-section">
         
          <div className="static-globe-text">
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
        <h1>Human Behaviour</h1>
        <p>With rising temperatures potentially encouraging more time spent outdoors, we are at higher risk than ever of getting skin cancer.<br/>
        <br/><h2>Could the primary problem lie in how we behave in the sun?</h2><br/> <b>The data suggest this just might be the case.</b>
        </p>
        <ScrollPeopleVisualization />
      </div>



    </div>
  );
}

export default App;
