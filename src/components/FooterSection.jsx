import React, { useRef, useEffect, useState } from "react";
import "./FooterSection.css";
import sunSVG from "../assets/sun.svg";

const FooterSection = () => {
  // state to know when to kick off the sun animation
  const [animateSun, setAnimateSun] = useState(false);
  const footerRef = useRef(null);

  // watch for the footer entering the viewport, then trigger animation once
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setAnimateSun(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.75 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={footerRef}
      className={`footer-section${animateSun ? " animate" : ""}`}
    >
      {/* sun graphic that slides down or fades in when visible */}
      <div className="footer-sun-container">
        <img
          src={sunSVG}
          alt="setting sun"
          className={`footer-sun${animateSun ? " animate" : ""}`}
        />
      </div>

      {/* wrap the closing thoughts */}
      <div className="footer-content-wrapper">
        <h2 className="footer-title">what now?</h2>
        <p className="footer-text">
          skin cancer causes and co-relations are largely things out of our individual control.
        </p>
        <p className="footer-text">
          however, our behavior is something we can manage, and by taking responsible measures we can minimize our exposure and risk.
        </p>
      </div>
    </section>
  );
};

export default FooterSection;
