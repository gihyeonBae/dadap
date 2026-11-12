import React, { useState, useEffect, useRef } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollSourceRef = useRef<any>(window);

  const toggleVisibility = (e?: any) => {
    const winScroll = window.scrollY || document.documentElement.scrollTop || 0;
    const targetScroll = e?.target?.scrollTop || 0;

    // 스크롤이 발생한 주체를 감지하여 저장
    if (targetScroll > 300) {
      scrollSourceRef.current = e.target;
    } else {
      scrollSourceRef.current = window;
    }

    setIsVisible(winScroll > 300 || targetScroll > 300);
  };

  const scrollToTop = () => {
    // 감지된 스크롤 요소가 있다면 우선적으로 스크롤 시도
    if (scrollSourceRef.current && typeof scrollSourceRef.current.scrollTo === 'function') {
      try { scrollSourceRef.current.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.body) document.body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, true);
    return () => window.removeEventListener('scroll', toggleVisibility, true);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        zIndex: 99999,
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#333',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
      }}
      aria-label="Go to top"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
