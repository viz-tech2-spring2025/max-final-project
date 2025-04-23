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
      "Basal Cell Carcinoma (BCC) is the most common form of skin cancer, arising from the basal cells located at the bottom of the epidermis—the outermost layer of the skin. It typically manifests on skin areas frequently exposed to the sun, such as the face, neck, ears, shoulders, and scalp.",
    image: img1,
  },
  {
    id: 1,
    category: "TYPES OF SKIN CANCER",
    title: "Squamous Cell Carcinoma",
    description:
      "Squamous Cell Carcinoma (SCC) is the second most common type of skin cancer, originating from the squamous cells, which form the upper layers of the epidermis. It typically appears on sun-exposed areas such as the face, ears, lips, scalp, neck, arms, and hands.",
    image: img2,
  },
  {
    id: 2,
    category: "TYPES OF SKIN CANCER",
    title: "Melanoma",
    description:
      "Melanoma is the most serious and aggressive form of skin cancer, originating in melanocytes—the cells responsible for producing melanin, the pigment that gives skin its color. Though less common than basal cell carcinoma or squamous cell carcinoma, melanoma has a much higher risk of spreading to other parts of the body (metastasizing), making early detection and treatment essential.",
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
