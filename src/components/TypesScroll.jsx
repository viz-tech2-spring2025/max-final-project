import React, { useEffect, useRef, useState } from "react";
import scrollama from "scrollama";
import img1 from "../assets/skincancerscrolly1.svg";
import img2 from "../assets/skincancerscrolly2.svg";
import img3 from "../assets/skincancerscrolly3.svg";
import "./TypesScroll.css";

// scroll steps — each one has its text and a matching image
const stepsData = [
  {
    id: 0,
    category: "TYPES OF SKIN CANCER",
    title: "Basal Cell Carcinoma",
    description:
      "Basal Cell Carcinoma (BCC) is the most common form of skin cancer, arising from the basal cells at the bottom of the epidermis. You’ll often see it on sun-exposed areas like the face, neck, ears, shoulders, and scalp.",
    image: img1,
  },
  {
    id: 1,
    category: "TYPES OF SKIN CANCER",
    title: "Squamous Cell Carcinoma",
    description:
      "Squamous Cell Carcinoma (SCC) starts in the squamous cells up top in the epidermis. It usually pops up on sun-baked spots like your face, ears, lips, neck, arms, and hands.",
    image: img2,
  },
  {
    id: 2,
    category: "TYPES OF SKIN CANCER",
    title: "Melanoma",
    description:
      "Melanoma is the most aggressive type, forming in melanocytes (the pigment-making cells). It’s rarer than BCC or SCC, but it spreads faster, so catching it early is key.",
    image: img3,
  },
];

const TypesScroll = () => {
  // which step are we on?
  const [activeIndex, setActiveIndex] = useState(0);
  // what image should we show right now?
  const [imageSrc, setImageSrc] = useState(stepsData[0].image);
  // fade effect
  const [opacity, setOpacity] = useState(1);
  const scroller = useRef(null);

  // set up Scrollama on mount to watch the steps
  useEffect(() => {
    scroller.current = scrollama();
    scroller.current
      .setup({
        step: ".scrolly-step", // look for these in the DOM
        offset: 0.5,           // trigger when halfway down
        debug: false,           
      })
      .onStepEnter(({ index }) => {
        // whenever a new step enters view, update our index
        setActiveIndex(index);
      });

    // resize handler so Scrollama recalculates positions
    window.addEventListener("resize", scroller.current.resize);

    // cleanup on unmount
    return () => {
      scroller.current.destroy();
      window.removeEventListener("resize", scroller.current.resize);
    };
  }, []);

  // when activeIndex changes, fade out old image, swap, then fade back in
  useEffect(() => {
    setOpacity(0);
    const t = setTimeout(() => {
      setImageSrc(stepsData[activeIndex].image);
      setOpacity(1);
    }, 500); // match the CSS transition duration
    return () => clearTimeout(t);
  }, [activeIndex]);

  return (
    <div className="scrolly-wrapper">
      {/* the scrolling text column */}
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

      {/* the image that updates as you scroll */}
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
