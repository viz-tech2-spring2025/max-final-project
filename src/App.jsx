// App.jsx
import React from 'react';
import LandingSection from './components/LandingSection';
import ChoroplethMap from './components/ChoroplethMap';
import './App.css';
import aggregatedData from './data/aggregatedData.json';

console.log("Aggregated Data in App:", aggregatedData);

function App() {
  return (
    <div className="site-wrapper">
      <LandingSection />
      <div className="app-container">
        <ChoroplethMap dataByYear={aggregatedData} />
      </div>
    </div>
  );
}

export default App;
