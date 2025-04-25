import React, { useEffect, useRef, useState } from 'react';
import scrollama from 'scrollama';

import personIcon      from '../assets/newPerson.svg';
import sunscreenBottle from '../assets/sunscreen-bottle.png';
import hatIcon         from '../assets/hat.png';
import shirtIcon       from '../assets/shirt.png';

import './ScrollPeopleVisualization.css';

// how many icons per column
const peoplePerColumn = 25;

// define each sun-safe habit section with its text, image, and data
const sections = [
  {
    title: 'sunscreen use',
    introText:
      'sunscreen is your first line of defense against uv damage. let’s see how key states measure up when spending time in the sun.',
    introImage: sunscreenBottle,
    icon: sunscreenBottle,
    data: [
      { city: 'california', percentage: 35,   text: 'only 35% of californians claim to use sunscreen more than 50% of the time.' },
      { city: 'colorado',   percentage: 46.5, text: 'colorado fares better, with 46.5% of surveyed individuals using sunscreen more than 50% of the time.' },
      { city: 'hawaii',     percentage: 19.1, text: 'but by far the worst is hawaii, with only 19.1% of people lathering up regularly.' },
    ],
  },
  {
    title: 'hat-wearing rates',
    introText:
      'hats shield your face and scalp. how common is this simple habit across states?',
    introImage: hatIcon,
    icon: hatIcon,
    data: [
      { city: 'california', percentage: 9.7,  text: 'just under 10% in the golden state are wearing hats often.' },
      { city: 'colorado',   percentage: 20.7, text: 'america’s switzerland yields the highest rate, at 20.7% wearing hats regularly.' },
      { city: 'hawaii',     percentage: 9.5,  text: 'coming in last is hawaii, where just 9.5% don a hat in the sun.' },
    ],
  },
  {
    title: 'protective clothing',
    introText:
      'cover-ups and upf fabrics block harmful rays. check out clothing-up rates state by state.',
    introImage: shirtIcon,
    icon: shirtIcon,
    data: [
      { city: 'california', percentage: 58.7, text: 'california comes in at 58.7% regularly wearing protective clothing.' },
      { city: 'colorado',   percentage: 57.2, text: 'in the mountains, 57.2% of coloradans opt for protective clothing often.' },
      { city: 'hawaii',     percentage: 63.1, text: 'hawaii wins here, with 63.1% wearing appropriate clothing more than half the time.' },
    ],
  },
];

// main scroll-driven visualization component
export default function ScrollPeopleVisualization() {
  // track which section is active
  const [activeIndex, setActiveIndex] = useState(0);
  const scroller = useRef(null);

  // set up scrollama to watch our .scroll-step elements
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

  // calculate where each section’s list of steps starts in the overall index
  const cumulativeOffsets = sections.map((_, i) =>
    sections.slice(0, i).reduce((sum, sec) => sum + sec.data.length, 0)
  );

  return (
    <>
      {sections.map((sec, i) => (
        // render each habit section
        <Section
          key={i}
          {...sec}
          activeIndex={activeIndex}
          startIndex={cumulativeOffsets[i]}
        />
      ))}

      <div className="conclusion-wrapper">
        <p className="conclusion-text">
          across all states, some sun-safe habits are catching on, but there’s still room to improve. make sun protection part of your daily routine—your skin will thank you.
        </p>
      </div>
    </>
  );
}

// individual section with intro and people-grid scrolling parts
function Section({ title, introText, introImage, data, icon, activeIndex, startIndex }) {
  // figure out which item in this section is active
  const localIndex = activeIndex - startIndex;

  return (
    <>
      {/* section header */}
      <h2 className="section-title">{title}</h2>

      {/* intro text + image */}
      <div className="intro-wrapper">
        <div className="intro-text">
          <p>{introText}</p>
        </div>
        <div className="intro-image">
          <img src={introImage} alt={title} />
        </div>
      </div>

      {/* scrolling text + corresponding people grid */}
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
                  {/* city label and percentage */}
                  <h3>{step.city}</h3>
                  <div className="percentage-label">{step.percentage.toFixed(1)}%</div>

                  {/* grid of person icons, highlighted up to the percentage */}
                  <div className="people-grid">
                    {Array.from({ length: peoplePerColumn }).map((_, i) => {
                      if (!isActive) {
                        // dimmed icons when not in focus
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
                        // fully highlighted icons
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
                        // partially highlighted icon for the fractional part
                        return (
                          <div key={i} className="icon-wrapper">
                            <img
                              src={icon}
                              alt=""
                              className="person-icon dimmed"
                            />
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
                      // remaining dimmed icons
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
