import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';

// 1. Props 타입 인터페이스 추가
interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  const navigate = useNavigate();

  // 초저속 및 고휘도 유지를 위한 드로잉 설정
  const ultraSlowDraw: Variants = {
    hidden: { pathLength: 0, opacity: 0.8 }, // 시작 불투명도를 높여 어두워짐 방지
    visible: {
      pathLength: [0, 1, 1, 0],
      opacity: [0.8, 1, 1, 0.8], // 전체 구간에서 높은 밝기 유지
      transition: {
        duration: 8, // 5.5초에서 8초로 추가 감속
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 1.5 // 호흡 주기를 길게 가져가 정적인 고급감 강조
      }
    }
  };

  return (
    <div 
      onClick={() => navigate('/')}
      className={`inline-flex items-center cursor-pointer select-none ${className || ''}`}
    >
      <svg 
        viewBox="0 0 520 120" 
        className="w-44 h-auto overflow-visible" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 밝기를 강조한 고휘도 글라스 필터 */}
          <filter id="high-bright-glass" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur" />
            <feSpecularLighting 
              in="blur" 
              surfaceScale="10" 
              specularConstant="3" // 반사광 강도 상향
              specularExponent="50" 
              lightingColor="#ffffff" 
              result="specOut"
            >
              <fePointLight x="-120" y="-150" z="400" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
            {/* 그림자 농도를 낮춰 전체적인 명도 확보 */}
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
            stroke="#3B82F6"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />

          {/* A (Blue) */}
          <motion.path
            d="M125,95 L155,25 L185,95 M135,70 Q155,50 175,70"
            stroke="#3B82F6"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />

          {/* D */}
          <motion.path
            d="M230,25 V95 H255 C285,95 285,25 255,25 H230 Z"
            stroke="#3B82F6"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />

          {/* A (Blue) */}
          <motion.path
            d="M315,95 L345,25 L375,95 M325,70 Q345,50 365,70"
            stroke="#3B82F6"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />

          {/* P */}
          <motion.path
            d="M420,95 V25 H455 C485,25 485,75 455,75 H420"
            stroke="#3B82F6"
            variants={ultraSlowDraw}
            initial="hidden"
            animate="visible"
          />
        </g>
      </svg>
    </div>
  );
};

export default Logo;