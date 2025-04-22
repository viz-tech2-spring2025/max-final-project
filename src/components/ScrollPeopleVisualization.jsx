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
      'Sunscreen is your first line of defense against UV damage. Let’s see how each city measures up.',
    introImage: sunscreenBottle,
    icon: sunscreenBottle,
    data: [
      {
        city: 'San Francisco',
        percentage: 30,
        text: 'Only 30% of San Franciscans report using sunscreen regularly.',
      },
      {
        city: 'Denver',
        percentage: 25,
        text: 'Just 25% in Denver block up—and the mile‑high sun is no joke.',
      },
      {
        city: 'Honolulu',
        percentage: 40,
        text: 'Honolulu leads at 40%, but that still means many go unprotected.',
      },
    ],
  },
  {
    title: 'Hat‑Wearing Rates',
    introText:
      'Hats shield your face and scalp. How common is this simple habit across cities?',
    introImage: hatIcon,
    icon: hatIcon,
    data: [
      {
        city: 'San Francisco',
        percentage: 50,
        text: 'Half of folks in SF don a hat when outdoors—better but not perfect.',
      },
      {
        city: 'Denver',
        percentage: 45,
        text: '45% of Denverites grab a cap before heading outside.',
      },
      {
        city: 'Honolulu',
        percentage: 60,
        text: 'Hats are popular in Honolulu—60% wear them, likely thanks to strong sun.',
      },
    ],
  },
  {
    title: 'Protective Clothing',
    introText:
      'Cover‑ups and UPF fabrics block harmful rays. Check out the clothing‑up rates city by city.',
    introImage: shirtIcon,
    icon: shirtIcon,
    data: [
      {
        city: 'San Francisco',
        percentage: 35,
        text: 'Only 35% cover up with long sleeves or UPF gear in SF.',
      },
      {
        city: 'Denver',
        percentage: 30,
        text: 'Denver sits at 30% for sun‑protective clothing.',
      },
      {
        city: 'Honolulu',
        percentage: 50,
        text: 'Half the population in Honolulu opts for UPF clothing.',
      },
    ],
  },
];

export default function ScrollPeopleVisualization() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current = scrollama()
      .setup({ step: '.scroll-step', offset: 0.6, debug: false })
      .onStepEnter(({ index }) => {
        setActiveIndex(index);
      });

    window.addEventListener('resize', scroller.current.resize);
    return () => {
      scroller.current.destroy();
      window.removeEventListener('resize', scroller.current.resize);
    };
  }, []);

  // compute start index for each section (cumulative sum of previous lengths)
  const cumulativeOffsets = sections.map((_, i) =>
    sections.slice(0, i).reduce((sum, sec) => sum + sec.data.length, 0)
  );

  return (
    <>
      {sections.map((sec, i) => (
        <Section
          key={i}
          title={sec.title}
          introText={sec.introText}
          introImage={sec.introImage}
          data={sec.data}
          icon={sec.icon}
          activeIndex={activeIndex}
          startIndex={cumulativeOffsets[i]}
        />
      ))}
    </>
  );
}

function Section({
  title,
  introText,
  introImage,
  data,
  icon,
  activeIndex,
  startIndex,
}) {
  // local index within this section
  const localIndex = activeIndex - startIndex;

  return (
    <>
      <h2 className="section-title">{title}</h2>

      <div className="intro-wrapper">
        <div className="intro-text">
          <p>{introText}</p>
        </div>
        <div className="intro-image">
          <img src={introImage} alt={title} />
        </div>
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
              const highlightCount = Math.round(
                (step.percentage / 100) * peoplePerColumn
              );
              return (
                <div
                  key={step.city}
                  className={`city-column ${isActive ? 'active' : ''}`}
                >
                  <h3>{step.city}</h3>
                  <div className="people-grid">
                    {Array.from({ length: peoplePerColumn }).map((_, i) => (
                      <img
                        key={i}
                        src={icon}
                        alt={`${title} icon`}
                        className={`person-icon ${
                          isActive && i < highlightCount
                            ? 'highlighted'
                            : 'dimmed'
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
