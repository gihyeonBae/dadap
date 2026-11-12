import React, { useEffect, useRef, useState } from 'react';

type Slide = { src: string; alt?: string };

const slides: Slide[] = [
  { src: '/images/RealMode.png', alt: 'Real Mode' },
  { src: '/images/PracticeMode.png', alt: 'Practice Mode' },
  { src: '/images/CS_Study_Category.png', alt: 'Study Category' },
  { src: '/images/CS_Study_Detail.png', alt: 'Study Detail' },
];

const HeroImageSlider: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    timeoutRef.current = window.setTimeout(() => {
      setIndex(i => (i + 1) % slides.length);
    }, 4500);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [index, isPaused]);

  const go = (next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  };

  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        style={{
          position: 'fixed',
          right: '8%',
          top: '18vh',
          width: '44%',
          maxWidth: '60vw',
          maxHeight: '78vh',
          height: 'auto',
          overflow: 'hidden',
          borderRadius: 24,
          zIndex: 0,
          pointerEvents: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
        }}
      >
        <div
          style={{
            display: 'flex',
            width: `${slides.length * 100}%`,
            transform: `translateX(-${index * (100 / slides.length)}%)`,
            transition: 'transform 600ms ease',
          }}
        >
          {slides.map(s => (
            <img
              key={s.src}
              src={s.src}
              alt={s.alt || ''}
              style={{
                width: `${100 / slides.length}%`,
                flex: `0 0 ${100 / slides.length}%`,
                objectFit: 'cover',
                maxHeight: '78vh',
                display: 'block',
                pointerEvents: 'none',
                filter: 'brightness(1.08) saturate(1.06)',
              }}
            />
          ))}
        </div>

        {/* Prev/Next buttons inside image container */}
        <button aria-label="Previous slide" onClick={prev} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10, pointerEvents: 'auto',
          width: 44, height: 44, borderRadius: 9999, background: 'rgba(0,0,0,0.45)', color: 'white', border: 'none', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>‹</button>

        <button aria-label="Next slide" onClick={next} style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10, pointerEvents: 'auto',
          width: 44, height: 44, borderRadius: 9999, background: 'rgba(0,0,0,0.45)', color: 'white', border: 'none', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>›</button>

        {/* Dots centered at bottom inside container */}
        <div style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => go(i)}
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: i === index ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.28)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const controlBtnStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 9999,
  background: 'rgba(0,0,0,0.5)',
  color: 'white',
  border: 'none',
  fontSize: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export default HeroImageSlider;
