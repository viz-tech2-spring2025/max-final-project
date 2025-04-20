import React, { useEffect, useRef, useState } from 'react';
import scrollama from 'scrollama';
import personIcon from '../assets/newPerson.svg';
import sunscreenBottle from '../assets/sunscreen-bottle.png';
import './ScrollPeopleVisualization.css';

const stepsData = [
  // Intro step
  {
    type: 'intro',
    id: 0,
    text: 'In California, only 27% of people claim to use sunblock often, despite a continually rising rate of skin cancer diagnosis.',
    image: sunscreenBottle
  },
  // City steps
  { type: 'city', id: 1, city: 'San Francisco', percentage: 30, text: 'San Francisco has the lowest sunscreen use at 30% and needs greater awareness.' },
  { type: 'city', id: 2, city: 'Denver', percentage: 25, text: 'Denver reports 25% sunscreen use; we can improve protective behaviors.' },
  { type: 'city', id: 3, city: 'Honolulu', percentage: 40, text: 'Honolulu leads at 40% sunscreen use but still leaves many unprotected.' }
];

const peoplePerColumn = 25;

const ScrollPeopleVisualization = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current = scrollama();
    scroller.current
      .setup({ step: '.scroll-step', offset: 0.5, debug: false })
      .onStepEnter(response => setActiveIndex(response.index));

    window.addEventListener('resize', scroller.current.resize);
    return () => {
      scroller.current.destroy();
      window.removeEventListener('resize', scroller.current.resize);
    };
  }, []);

  return (
    <div className="scrolly-wrapper">
      {/* Text side */}
      <div className="scrolly-text">
        {stepsData.map((step, idx) => (
          <div
            key={step.id}
            className={`scroll-step ${idx === activeIndex ? 'active' : ''}`}
          >
            <p>{step.text}</p>
          </div>
        ))}
      </div>

      {/* Visualization side */}
      <div className="scrolly-image">
        {stepsData[activeIndex].type === 'intro' ? (
          <div className="intro-image-container">
            <img src={stepsData[activeIndex].image} alt="Intro illustration" />
          </div>
        ) : (
          <div className="people-visualization">
            {stepsData.filter(s => s.type === 'city').map((step, idx) => {
              const isActive = (idx + 1) === activeIndex;
              const highlightCount = Math.round((step.percentage / 100) * peoplePerColumn);
              return (
                <div
                  key={step.id}
                  className={`city-column ${isActive ? 'active' : ''}`}
                >
                  <h3>{step.city}</h3>
                  <div className="people-grid">
                    {Array.from({ length: peoplePerColumn }).map((_, i) => (
                      <img
                        key={i}
                        src={personIcon}
                        alt="person"
                        className={`person-icon ${isActive && i < highlightCount ? 'highlighted' : 'dimmed'}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollPeopleVisualization;
