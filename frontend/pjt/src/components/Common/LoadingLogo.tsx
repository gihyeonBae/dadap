import { motion } from 'framer-motion';

const LoadingLogo = () => {
  // 로딩 화면 전용으로 useNavigate와 onClick 핸들러가 제거되었습니다.
  
  const ultraSlowDraw = {
    hidden: { pathLength: 0, opacity: 0.8 },
    visible: {
      pathLength: [0, 1, 1, 0],
      opacity: [0.8, 1, 1, 0.8],
      transition: {
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 1.5
      }
    }
  };

  return (
    <div 
      className="inline-flex items-center select-none" // 커서 포인터 제거
    >
      <svg 
        viewBox="0 0 520 120" 
        className="w-44 h-auto overflow-visible" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="high-bright-glass" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur" />
            <feSpecularLighting 
              in="blur" 
              surfaceScale="10" 
              specularConstant="3" 
              specularExponent="50" 
              lightingColor="#ffffff" 
              result="specOut"
            >
              <fePointLight x="-120" y="-150" z="400" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        <g 
          filter="url(#high-bright-glass)" 
          fill="none" 
          strokeWidth="20" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* D */}
          <motion.path
            d="M40,25 V95 H65 C95,95 95,25 65,25 H40 Z"
            stroke="var(--text-main)"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />

          {/* A (Blue) */}
          <motion.path
            d="M125,95 L155,25 L185,95 M135,70 Q155,50 175,70"
            stroke="var(--accent-primary)"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />

          {/* D */}
          <motion.path
            d="M230,25 V95 H255 C285,95 285,25 255,25 H230 Z"
            stroke="var(--text-main)"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />

          {/* A (Blue) */}
          <motion.path
            d="M315,95 L345,25 L375,95 M325,70 Q345,50 365,70"
            stroke="var(--accent-primary)"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />

          {/* P */}
          <motion.path
            d="M420,95 V25 H455 C485,25 485,75 455,75 H420"
            stroke="var(--text-main)"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />
        </g>
      </svg>
    </div>
  );
};

export default LoadingLogo;
