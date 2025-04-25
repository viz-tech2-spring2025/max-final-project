import React, { useState, useEffect } from 'react';

import LandingSection   from './components/LandingSection';
import ChoroplethMap    from './components/ChoroplethMap';
import SkinCancerInfo   from './components/SkinCancerInfo';
import TypesScroll      from './components/TypesScroll';
import ScrollPeopleVisualization from './components/ScrollPeopleVisualization';

import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import DualChoroplethMap from './components/DualChoroplethMap';
import OzoneGlobeDeck from './components/OzoneGlobeDeck';
import StaticOzoneGlobeDeck from './components/StaticOzoneGlobeDeck';
import FooterSection from './components/FooterSection';
import ScrollytellingAnomalies from './components/TempScrollMap';


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
    {/* Landing section + text */},
    <div className="site-wrapper">
      <LandingSection />
      <div className="app-container">
      <h1>1 in 5 Americans will develop skin cancer in their lifetime.</h1>
        {loading ? (
          <div>Loading map data…</div>
        ) : (
          <ChoroplethMap dataByYear={dataByYear} />
        )}
      </div>
      {/* Cancer information section */},  
      <div className="app-container">
        <SkinCancerInfo />
      </div>
      {/* Scrolly information section */}
      <div className="app-container">
        <TypesScroll />
      </div>
      {/* Key factors section*/}
      <div className="app-container key-factors">
        <h2 className="key-factors-title">What are the key factors?</h2>
        <div className="key-factors-content">
          <p className="key-factors-intro">
            People point to a variety of factors when it comes to skin cancer, but it really boils down to an exposure problem.  
            Here are the three primary factors we’ll investigate:
          </p>
          <ul className="key-factors-list">
            <li>The ozone layer</li>
            <li>How rising temperatures might affect us</li>
            <li>How we behave in the sun</li>
          </ul>
        </div>
      </div>
      {/* Large ozone globe */}
      <div className="map-section">
        <OzoneGlobeDeck />
      </div>
      {/* Ozone globe information section*/}
      <div className="app-container">
        <h1>The Ozone Layer</h1>
        <div className="app-container static-globe-section">
          <div className="static-globe-text">
            <p>Since the Monteral Protocol in 1987, the ozone layer has experienced considerable levels of repair. In this visualization, we can
            see that the primary ozone hole exists above Antarctica. While this might be a primary cause of rising sea levels, the ozone has 
            actually undergone considerable repair since the induction of the Monteral Protocol in 1987, and isn't a primary reason why
            skin cancer diagnosis rates are rising.</p>
          </div>
          <StaticOzoneGlobeDeck />
        </div>
      </div>

     <div className="app-container">
       <h2 className="section-title">Skin Cancer Diagnosis Rates VS UV Index (2006)</h2>
       <p className="section-text">
         While through these maps we can see that there is some correlation between UV and skin cancer diagnosis rates, its a weak at best.
         This begs the question: if the environmental changes the world is ungoing isn't primarily responsible, what is?
       </p>
     </div>
      {/* Small multiples uv vs skin cancer diagnosis maps */}
      <div className="app-container">
        <DualChoroplethMap />
      </div>
      {/* Anomaly mapbox scrollytelling */}
      <div className="app-container">
        <div className="app-container anomaly">
        <h1>County Temperature Anomalies</h1>
        <p className="anomaly-intro">
          As global temperatures rise, experts suggest that perhaps people are spending more time otuside than ever.
          This map shows the anomalies of counties (difference from expected average temperature) in March of this year.
          This allows us to understand as temperaures increase, the conidtions for outdoor acitivities cover a larger portion of the year.
        </p>
        <h3 className="anomaly-subtitle">
          Scroll down to explore anomalies in the Bay Area, Denver, and Hawaiʻi.
        </h3>
      </div>
        <ScrollytellingAnomalies />
      </div>
      {/* Survey data mapping */}
      <div className="app-container human-behaviour">
        <h1>Human Behaviour</h1>
        <p className="human-behaviour-intro">
          So, with rising temperatures potentially encouraging more time spent outdoors, we are at higher risk than ever of getting skin cancer.
        </p>
        <h3 className="human-behaviour-subtitle">
          Could the primary problem lie in how we behave in the sun?
        </h3>
        <p className="human-behaviour-note">
          <strong>The data suggest this just might be the case.</strong>
        </p>
        <ScrollPeopleVisualization />
      </div>
      {/* Footer */}
      <div className="app-container">
        <FooterSection />
      </div>
    </div>
  );
}

export default App;
