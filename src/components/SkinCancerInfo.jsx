// src/components/SkinCancerInfo.jsx
import React from 'react';
import './SkinCancerInfo.css';
import infoSVG from '../assets/what is skin cancer landing ilustration.svg'; // adjust the path if necessary

const SkinCancerInfo = () => {
  return (
    <section className="info-section">
      <div className="content-wrapper">
        <h1 className="landing-title">What is Skin Cancer?</h1>
            <p className="info-landing-subtitle">
            Skin cancer is a type of cancer that forms in the cells of the skin. It most often develops on skin exposed to ultraviolet (UV) radiation from the sun or tanning beds. Understanding the causes, types, and prevention methods of skin cancer can help reduce risks and promote early detection.
            </p>
        <img src={infoSVG} alt="What is Skin Cancer Illustration" className="info-svg" />
      </div>
    </section>
  );
};

export default SkinCancerInfo;
