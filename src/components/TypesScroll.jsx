import React, { useEffect, useRef, useState } from "react";
import scrollama from "scrollama";
import img1 from "../assets/skincancerscrolly1.svg";
import img2 from "../assets/skincancerscrolly2.svg";
import img3 from "../assets/skincancerscrolly3.svg";
import "./TypesScroll.css";

const stepsData = [
  {
    id: 0,
    category: "TYPES OF SKIN CANCER",
    title: "Basal Cell Carcinoma",
    description:
      "This is a placeholder description for basal cell carcinoma. Replace with your own text describing what it is, how common, etc.",
    image: img1,
  },
  {
    id: 1,
    category: "TYPES OF SKIN CANCER",
    title: "Squamous Cell Carcinoma",
    description:
      "A type of skin cancer that develops from squamous cells, which are flat, scale‑like cells that line the skin and other body surfaces.",
    image: img2,
  },
  {
    id: 2,
    category: "TYPES OF SKIN CANCER",
    title: "Melanoma",
    description:
      "This is a placeholder description for melanoma. Replace with your own text about why it’s more dangerous, risk factors, etc.",
    image: img3,
  },
];

const TypesScroll = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(stepsData[0].image);
  const [opacity, setOpacity] = useState(1);
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current = scrollama();
    scroller.current
      .setup({
        step: ".scrolly-step",
        offset: 0.5,
        debug: false,
      })
      .onStepEnter(({ index }) => {
        setActiveIndex(index);
      });

    window.addEventListener("resize", scroller.current.resize);
    return () => {
      scroller.current.destroy();
      window.removeEventListener("resize", scroller.current.resize);
    };
  }, []);

  useEffect(() => {
    setOpacity(0);
    const t = setTimeout(() => {
      setImageSrc(stepsData[activeIndex].image);
      setOpacity(1);
    }, 500);
    return () => clearTimeout(t);
  }, [activeIndex]);

  return (
    <div className="scrolly-wrapper">
      <div className="scrolly-text">
        {stepsData.map((step, i) => (
          <div
            key={step.id}
            className={`scrolly-step ${i === activeIndex ? "active" : ""}`}
          >
            <div className="step-content">
              <h3>{step.category}</h3>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="scrolly-image">
        <img
          src={imageSrc}
          alt={`Illustration for ${stepsData[activeIndex].title}`}
          style={{ opacity, transition: "opacity 0.5s ease-in-out" }}
        />
      </div>
    </div>
  );
};

export default TypesScroll;
