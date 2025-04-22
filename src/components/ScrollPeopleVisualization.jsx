import React, { useEffect, useRef, useState } from 'react';
import scrollama from 'scrollama';
import personIcon from '../assets/newPerson.svg';
import sunscreenBottle from '../assets/sunscreen-bottle.png';
import './ScrollPeopleVisualization.css';

const stepsData = [
  {
    type: 'intro',
    id: 0,
    text: 'Sunscreen is a primary repellent when it comes to the battle against skin cancer. Let’s explore just how good we are at using it',
    image: sunscreenBottle
  },
  { type: 'city', id: 1, city: 'San Francisco', percentage: 30, text: 'San Francisco has the lowest sunscreen use at 30% and needs greater awareness.' },
  { type: 'city', id: 2, city: 'Denver',       percentage: 25, text: 'Denver reports 25% sunscreen use; we can improve protective behaviors.' },
  { type: 'city', id: 3, city: 'Honolulu',     percentage: 40, text: 'Honolulu leads at 40% sunscreen use but still leaves many unprotected.' }
];

const citySteps = stepsData.filter(s => s.type === 'city');
const peoplePerColumn = 25;

export default function ScrollPeopleVisualization() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current = scrollama()
      .setup({ step: '.scroll-step', offset: 0.5, debug: false })
      .onStepEnter(response => setActiveIndex(response.index));

    window.addEventListener('resize', scroller.current.resize);
    return () => {
      scroller.current.destroy();
      window.removeEventListener('resize', scroller.current.resize);
    };
  }, []);

  return (
    <>
      <div className="intro-wrapper">
        <div className="intro-text">
          <p>{stepsData[0].text}</p>
        </div>
        <div className="intro-image">
          <img src={stepsData[0].image} alt="Sunscreen bottle" />
        </div>
      </div>

      <div className="scrolly-wrapper">
        <div className="scrolly-text">
          {citySteps.map((step, idx) => (
            <div
              key={step.id}
              className={`scroll-step ${idx === activeIndex ? 'active' : ''}`}
            >
              <p>{step.text}</p>
            </div>
          ))}
        </div>
        <div className="scrolly-image">
          <div className="people-visualization">
            {citySteps.map((step, idx) => {
              const isActive      = idx === activeIndex;
              const highlightCount = Math.round((step.percentage / 100) * peoplePerColumn);
              return (
                <div key={step.id} className={`city-column ${isActive ? 'active' : ''}`}>
                  <h3>{step.city}</h3>
                  <div className="people-grid">
                    {Array.from({ length: peoplePerColumn }).map((_, i) => (
                      <img
                        key={i}
                        src={personIcon}
                        alt="person"
                        className={`person-icon ${
                          isActive && i < highlightCount ? 'highlighted' : 'dimmed'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
