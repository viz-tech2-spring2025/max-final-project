import React, { useRef, useEffect, useState } from "react";
import "./FooterSection.css";
import sunSVG from "../assets/sun.svg";

const FooterSection = () => {
  const [animateSun, setAnimateSun] = useState(false);
  const footerRef = useRef(null);

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
      className={`footer-section${animateSun ? " animate" : ""}`}
      ref={footerRef}
    >
      <div className="footer-sun-container">
        <img
          src={sunSVG}
          alt="Setting sun"
          className={`footer-sun${animateSun ? " animate" : ""}`}
        />
      </div>
      <div className="footer-content-wrapper">
        <h2 className="footer-title">What now?</h2>
        <p className="footer-text">
          Skin cancer causes and co-relations are largely things out of our
          individual control.
        </p>
        <p className="footer-text">
          However, our behaviour is something that we can control, and by
          taking appropriate and responsible measures, we can minimize our
          exposure and risk of skin cancer.
        </p>
      </div>
    </section>
  );
};

export default FooterSection;
