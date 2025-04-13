import React, { useEffect, useRef, useState } from "react";
import scrollama from "scrollama";
import img1 from "../assets/skincancerscrolly1.svg";
import img2 from "../assets/skincancerscrolly2.svg";
import img3 from "../assets/skincancerscrolly3.svg";
import "./TypesScroll.css";

const stepsData = [
    {
      id: 0,
      text: "Section 1: Introduction to skin cancer – what it is, basic risk factors, and why awareness is important.",
      image: img1,
    },
    {
      id: 1,
      text: "Section 2: Dive deeper into causes, environmental risks, and preventive measures.",
      image: img2,
    },
    {
      id: 2,
      text: "Section 3: Explore treatment options and early detection techniques with a call to action.",
      image: img3,
    },
  ];
  
  const TypesScroll = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    // imageSrc = current image
    const [imageSrc, setImageSrc] = useState(stepsData[0].image);
    // opacity controls fade
    const [opacity, setOpacity] = useState(1);
    const scroller = useRef(null);
    const containerRef = useRef(null);
  
    useEffect(() => {
      scroller.current = scrollama();
      scroller.current
        .setup({
          step: ".scrolly-step",
          offset: 0.5, // triggers at 50%
          debug: false,
        })
        .onStepEnter((response) => {
          setActiveIndex(response.index);
        });
      window.addEventListener("resize", scroller.current.resize);
      return () => {
        scroller.current.destroy();
        window.removeEventListener("resize", scroller.current.resize);
      };
    }, []);
  
    // when the active text section changes, perform a fade transition on the image.
    useEffect(() => {
      // fade out the current image.
      setOpacity(0);
      // after the ade-out duration, update the image and fade it in.
      const timeoutId = setTimeout(() => {
        setImageSrc(stepsData[activeIndex].image);
        setOpacity(1);
      }, 500); // adjust the timeout (ms) to match the CSS transition duration.
      return () => clearTimeout(timeoutId);
    }, [activeIndex]);
  
    return (
      <div className="scrolly-wrapper" ref={containerRef}>
        <div className="scrolly-text">
          {stepsData.map((step, index) => (
            <div
              key={step.id}
              className={`scrolly-step ${index === activeIndex ? "active" : ""}`}
            >
              <p>{step.text}</p>
            </div>
          ))}
        </div>
        <div className="scrolly-image">
          <img
            src={imageSrc}
            alt={`Illustration for section ${activeIndex + 1}`}
            style={{ transition: "opacity 0.5s ease-in-out", opacity: opacity }}
          />
        </div>
      </div>
    );
  };
  
  export default TypesScroll;