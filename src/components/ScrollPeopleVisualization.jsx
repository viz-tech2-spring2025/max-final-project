import React, { useEffect, useRef, useState } from 'react';
import scrollama from 'scrollama';

import personIcon      from '../assets/newPerson.svg';
import sunscreenBottle from '../assets/sunscreen-bottle.png';
import hatIcon         from '../assets/hat.png';
import shirtIcon       from '../assets/shirt.png';

import './ScrollPeopleVisualization.css';

const peoplePerColumn = 25;

// define each section with its own data and assets
const sections = [
  {
    title: 'Sunscreen Use',
    introText:
      'Sunscreen is your first line of defense against UV damage. Let’s see how key states measure up when spending time in the sun.',
    introImage: sunscreenBottle,
    icon: sunscreenBottle,
    data: [
      { city: 'California', percentage: 35,   text: 'Only 35% of Californians claim to use sunscreen more than 50% of the time.' },
      { city: 'Colorado',   percentage: 46.5, text: 'Colorado fares better, with 46.5% of surveyed individuals using sunscreen more than 50% of the time.' },
      { city: 'Hawaii',     percentage: 19.1, text: 'But by far the worst is Hawaii, with only 19.1% of people lathering up regularly.' },
    ],
  },
  {
    title: 'Hat-Wearing Rates',
    introText:
      'Hats shield your face and scalp. How common is this simple habit across states?',
    introImage: hatIcon,
    icon: hatIcon,
    data: [
      { city: 'California', percentage: 9.7,  text: 'Just under 10% of the people from the Golden State are wearing hats often.' },
      { city: 'Colorado',   percentage: 20.7, text: 'America’s Switzerland yields the highest percentage of the three, at 20.7% wearing hats on a regular basis.' },
      { city: 'Hawaii',     percentage: 9.5,  text: 'Coming in last is Hawaii, where just 9.5% of people are donning a hat in the sun.' },
    ],
  },
  {
    title: 'Protective Clothing',
    introText:
      'Cover-ups and UPF fabrics block harmful rays. Check out the clothing-up rates state by state.',
    introImage: shirtIcon,
    icon: shirtIcon,
    data: [
      { city: 'California', percentage: 58.7, text: 'When it comes to appropriate clothing, we see some considerable jumps. California comes in with 58.7% of people regularly wearing protective clothing.' },
      { city: 'Colorado',   percentage: 57.2, text: 'Up in the mountains, 57.2% of Coloradans are wearing protective clothing often.' },
      { city: 'Hawaii',     percentage: 63.1, text: 'Winning the category is Hawaii, at a whopping 63.1% of people wearing appropriate clothing more than 50% of the time.' },
    ],
  },
];

export default function ScrollPeopleVisualization() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current = scrollama()
      .setup({ step: '.scroll-step', offset: 0.6, debug: false })
      .onStepEnter(({ index }) => setActiveIndex(index));

    window.addEventListener('resize', scroller.current.resize);
    return () => {
      scroller.current.destroy();
      window.removeEventListener('resize', scroller.current.resize);
    };
  }, []);

  const cumulativeOffsets = sections.map((_, i) =>
    sections.slice(0, i).reduce((sum, sec) => sum + sec.data.length, 0)
  );

  return (
    <>
      {sections.map((sec, i) => (
        <Section
          key={i}
          {...sec}
          activeIndex={activeIndex}
          startIndex={cumulativeOffsets[i]}
        />
      ))}

      {/* ————— Conclusive Statement ————— */}
      <div className="conclusion-wrapper">
        <p className="conclusion-text">
          Across all states, it’s clear that while some sun-safe habits are adopting traction, there’s still significant room for improvement. Make sun protection part of your daily routine—your skin will thank you.
        </p>
      </div>
    </>
  );
}

function Section({ title, introText, introImage, data, icon, activeIndex, startIndex }) {
  const localIndex = activeIndex - startIndex;

  return (
    <>
      <h2 className="section-title">{title}</h2>

      <div className="intro-wrapper">
        <div className="intro-text"><p>{introText}</p></div>
        <div className="intro-image"><img src={introImage} alt={title} /></div>
      </div>

      <div className="scrolly-wrapper">
        <div className="scrolly-text">
          {data.map((step, idx) => (
            <div
              key={step.city}
              className={`scroll-step ${idx === localIndex ? 'active' : ''}`}
            >
              <p>{step.text}</p>
            </div>
          ))}
        </div>

        <div className="scrolly-image">
          <div className="people-visualization">
            {data.map((step, idx) => {
              const isActive = idx === localIndex;
              const totalIcons = (step.percentage / 100) * peoplePerColumn;
              const fullCount  = Math.floor(totalIcons);
              const fraction   = totalIcons - fullCount;

              return (
                <div
                  key={step.city}
                  className={`city-column ${isActive ? 'active' : ''}`}
                >
                  <h3>{step.city}</h3>
                  <div className="percentage-label">{step.percentage.toFixed(1)}%</div>
                  <div className="people-grid">
                    {Array.from({ length: peoplePerColumn }).map((_, i) => {
                      if (!isActive) {
                        return (
                          <img
                            key={i}
                            src={icon}
                            alt=""
                            className="person-icon dimmed"
                          />
                        );
                      }
                      if (i < fullCount) {
                        return (
                          <img
                            key={i}
                            src={icon}
                            alt=""
                            className="person-icon highlighted"
                          />
                        );
                      }
                      if (i === fullCount && fraction > 0) {
                        return (
                          <div key={i} className="icon-wrapper">
                            {/* dimmed base */}
                            <img
                              src={icon}
                              alt=""
                              className="person-icon dimmed"
                            />
                            {/* clipped highlight on top */}
                            <img
                              src={icon}
                              alt=""
                              className="person-icon highlighted"
                              style={{
                                clipPath: `inset(0 ${100 - fraction * 100}% 0 0)`
                              }}
                            />
                          </div>
                        );
                      }
                      return (
                        <img
                          key={i}
                          src={icon}
                          alt=""
                          className="person-icon dimmed"
                        />
                      );
                    })}
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
