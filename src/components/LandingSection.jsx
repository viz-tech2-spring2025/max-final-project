import React, { useEffect, useState } from "react";
import "./LandingSection.css";
import sunSVG from "../assets/sun.svg"; 

const LandingSection = () => {
  const [animateSun, setAnimateSun] = useState(false);

  useEffect(() => {
    // Trigger glow after the rise animation finishes
    const timer = setTimeout(() => setAnimateSun(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  };

  return (
    <section className="landing-section">
      <div className="content-wrapper">
        <div className="sun-container">
          <img
            src={sunSVG}
            alt="Rising sun"
            className={`sun${animateSun ? " animate" : ""}`}
          />
        </div>
        <h1 className="landing-title">The Invisible Epidemic</h1>
        <p className="landing-subtitle">
          Skin cancer is one of the most common – and preventable – cancers in 
          the world. Yet, it continues to rise, powered by the choices we make 
          and the world we live in.
        </p>
        <div className="scroll-prompt" onClick={handleScroll}>
          <span>Scroll to explore</span>
          <div className="down-arrow">▼</div>
        </div>
      </div>
    </section>
  );
};

export default LandingSection;
