import React from 'react';
import LandingSection from './components/LandingSection';
import ChoroplethMap from './components/ChoroplethMap';
import SkinCancerInfo from './components/SkinCancerInfo';
import TypesScroll from './components/TypesScroll';
import './App.css';
import aggregatedData from './data/aggregatedData.json';
import OzoneGlobe from './components/OzoneGlobe';

function App() {
  return (
    <div className="site-wrapper">
      <LandingSection />
      <div className="app-container">
        <ChoroplethMap dataByYear={aggregatedData} />
      </div>
      <div className="app-container">
        <SkinCancerInfo />
      </div>
      <div className="app-container">
        <TypesScroll />
      </div>
     {/* <div className="app-container">
        <OzoneGlobe />
      </div> */}
    </div>
  );
}

export default App;
